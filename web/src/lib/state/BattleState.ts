import {derived} from 'svelte/store';
import {gameView, type GameView, type GameViewState} from './ViewState';
import {type CurrentCard, type Card, fromBigIntToCards} from 'template-game-common';

export type MonsterInBattle = {
	hp: number;
	kind: number; // TODO string
	attackCards: CurrentCard[];
	defenseCards: CurrentCard[];
	currentDefenseCardIndex: number;
	currentAttackCardIndex: number;
};

export type CharacterInBattle = {
	hp: number;
	attackCards: CurrentCard[];
	defenseCards: CurrentCard[];
};

export type BattleState =
	| {
			monster: MonsterInBattle;
			character: CharacterInBattle;
	  }
	| undefined;

function toCards(type: 'attack' | 'defense', gear: bigint, usedBitmap: number): CurrentCard[] {
	const cards = fromBigIntToCards(type, gear);

	// Calculate the mask for all cards being used
	const allUsedMask = (1 << cards.length) - 1;
	// Reset usedBitmap to 0 if all bits are set
	usedBitmap = usedBitmap === allUsedMask ? 0 : usedBitmap;

	return cards.map((v, i) => ({...v, used: ((usedBitmap >> i) & 1) === 1}));
}
const fromHexString = (hexString: string) => {
	const match = hexString.match(/.{1,2}/g);
	if (!match) {
		return new Uint8Array();
	}
	return Uint8Array.from(match.map((byte) => parseInt(byte, 16)));
};

const toHexString = (bytes: Uint8Array) => {
	return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
};

const monsterKinds = fromHexString(
	`04000008101020400000000000000000000000080000200000000000000000000600000810202040000000000000000000000008100020000000000000000000`,
);

export const battleState = derived<GameView, BattleState>(
	gameView,
	($gameView: GameViewState) => {
		if (
			$gameView.context &&
			$gameView.currentCharacter &&
			$gameView.inBattle &&
			$gameView.currentStateChanges &&
			$gameView.currentStateChanges.battle &&
			$gameView.currentStateChanges.battle.monsterIndexPlus1 > 0
		) {
			const kind = $gameView.inBattle.monster.kind;
			console.log({kind});
			const monsterKindAsArray = monsterKinds.slice(kind * 32, kind * 32 + 32);
			const monsterKindAsHex = toHexString(monsterKindAsArray);
			const monsterKind = BigInt(`0x${monsterKindAsHex}`);
			console.log({monsterKind, monsterKindAsArray, monsterKindAsHex});
			const monsterAttackGear = (monsterKind >> 128n) & 0x1fffffffffffffffffffffffffn;
			console.log({monsterAttackGear});
			//10 = 2 cards
			// 0000010 0000001 // 2 1
			// 0000001 0000001
			// 0000000000000000000000000000000000000000000000000000000000000000000000
			const monsterAttackCards = toCards(
				'attack',
				// TODO kind,
				monsterAttackGear,
				$gameView.currentStateChanges.battle.attackCardsUsed2,
			);
			console.log({monsterAttackCards});
			let currentAttackCardIndex = monsterAttackCards.findIndex((v) => !v.used);
			if (currentAttackCardIndex == -1) {
				currentAttackCardIndex = 0;
			}
			const monsterDefenseGear = monsterKind & 0x1fffffffffffffffffffffffffn;
			console.log({monsterDefenseGear});
			// 10 = 2 cards
			// 0000000 0000000 // 0 0
			// 0000001 0000000 // 1 0
			// 0000000000000000000000000000000000000000000000000000000000000000000000
			const monsterDefenseCards = toCards(
				'defense',
				// TODO kind,
				monsterDefenseGear,
				$gameView.currentStateChanges.battle.defenseCardsUsed2,
			);
			let currentDefenseCardIndex = monsterDefenseCards.findIndex((v) => !v.used);
			if (currentDefenseCardIndex == -1) {
				currentDefenseCardIndex = 0;
			}
			return {
				monster: {
					hp: $gameView.inBattle.monster.hp,
					kind,
					attackCards: monsterAttackCards,
					currentAttackCardIndex,
					defenseCards: monsterDefenseCards,
					currentDefenseCardIndex,
				},
				character: {
					hp: $gameView.currentCharacter.hp,
					attackCards: toCards(
						'attack',
						$gameView.context.attackGear,
						$gameView.currentStateChanges.battle.attackCardsUsed1,
					),
					defenseCards: toCards(
						'defense',
						$gameView.context.defenseGear,
						$gameView.currentStateChanges.battle.defenseCardsUsed1,
					),
				},
			};
		} else {
			return undefined;
		}
	},
	undefined,
);
