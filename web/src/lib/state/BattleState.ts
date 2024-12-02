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

const defaultMonster =
	//<uint8 hp>
	(4n << 248n) |
	//<uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>
	(2n << 226n) |
	(2n << 219n) |
	(1n << 212n) |
	(1n << 205n) |
	(1n << 198n) |
	//<uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>
	(2n << 98n) |
	(0n << 91n) |
	(0n << 84n) |
	(1n << 77n) |
	(0n << 70n);

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
			const monsterAttackGear = (defaultMonster >> 128n) & 0x1fffffffffffffffffffffffffn;
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
			const monsterDefenseGear = defaultMonster & 0x1fffffffffffffffffffffffffn;
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
