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
	return cards.map((v) => ({...v, used: false}));
}

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
			const monsterAttackCards = toCards(
				'attack',
				// TODO kind,
				643767809466671935455840174080n,
				$gameView.currentStateChanges.battle.attackCardsUsed2,
			);
			let currentAttackCardIndex = monsterAttackCards.findIndex((v) => !v.used);
			if (currentAttackCardIndex == -1) {
				currentAttackCardIndex = 0;
			}
			const monsterDefenseCards = toCards(
				'defense',
				// TODO kind,
				641311122266079177861601689600n,
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
