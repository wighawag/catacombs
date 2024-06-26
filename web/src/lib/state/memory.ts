import {setInitialCamera} from '$lib/tutorial';
import {writable} from 'svelte/store';
import type {StateChanges} from 'template-game-common';
import type {GameViewState} from './ViewState';

export type Move =
	| {
			position: {x: number; y: number};
			type: `move`;
	  }
	| {
			attackCardIndex: number;
			defenseCardIndex: number;
			type: `battle`;
	  };

export type MemoryState = {
	moves: Move[];
	stateChanges: StateChanges[];
	stateChangesTimestamp: number;
	inBattle?: {
		accepted?: boolean;
		cards: {
			choicePresented?: 'attack' | 'defense';
			attackChosen?: {cardIndex: number};
			defenseChosen?: {cardIndex: number};
			confirmed?: boolean;
		};

		resultAccepted?: boolean;
		endAccepted?: boolean;
	};
	tutorialStep: number;
};

const $store: MemoryState = {moves: [], stateChanges: [], tutorialStep: 0, stateChangesTimestamp: 0};
const store = writable<MemoryState>($store);

function addMove(move: Move, stateChanges: StateChanges) {
	$store.moves.push(move);
	$store.stateChanges.push(stateChanges);
	$store.stateChangesTimestamp = performance.now();
	store.set($store);
}

function reset() {
	if ($store.stateChanges.length == 0) {
		return false;
	}
	$store.moves.splice(0, $store.moves.length);
	$store.stateChanges.splice(0, $store.stateChanges.length);
	$store.stateChangesTimestamp = 0;
	$store.tutorialStep = 0;
	$store.inBattle = undefined;
	setInitialCamera();
	store.set($store);
	return true;
}

function rewind() {
	if ($store.stateChanges.length == 0) {
		return false;
	}
	$store.moves.pop();
	$store.stateChangesTimestamp = 0; // TODO allow rewind anim too
	$store.stateChanges.pop();
	$store.inBattle = undefined;
	if ($store.stateChanges.length == 0) {
		$store.tutorialStep = 0;
		setInitialCamera();
	}
	store.set($store);
	return true;
}

function tutorialNext() {
	$store.tutorialStep++;
	store.set($store);
}

function acceptBattle() {
	$store.inBattle = $store.inBattle || {cards: {}};
	$store.inBattle.accepted = true;
	$store.inBattle.endAccepted = false;
	store.set($store);
}

function acceptBattleResult(gameView: GameViewState) {
	if (gameView.inBattle?.monster.hp == 0) {
		$store.inBattle = undefined;
	} else if ($store.inBattle) {
		$store.inBattle.cards = {};
	}
	store.set($store);
}

function selectAttackCard(cardIndex: number) {
	if (!$store.inBattle) {
		throw new Error(`not in battle`);
	}
	$store.inBattle.cards.attackChosen = {
		cardIndex,
	};
	$store.inBattle.cards.choicePresented = undefined;
	store.set($store);
}

function selectDefenseCard(cardIndex: number) {
	if (!$store.inBattle) {
		throw new Error(`not in battle`);
	}
	$store.inBattle.cards.defenseChosen = {
		cardIndex,
	};
	$store.inBattle.cards.choicePresented = undefined;
	store.set($store);
}

function showChoice(choice: 'attack' | 'defense') {
	if (!$store.inBattle) {
		throw new Error(`not in battle`);
	}
	$store.inBattle.cards.choicePresented = choice;
	store.set($store);
}

function acceptEnd() {
	if (!$store.inBattle) {
		throw new Error(`not in battle`);
	}
	$store.inBattle.endAccepted = true;
	$store.inBattle.accepted = false;
	store.set($store);
}

export const memory = {
	$store,
	subscribe: store.subscribe,
	addMove,
	rewind,
	reset,
	tutorialNext,
	acceptBattle,
	acceptBattleResult,
	selectAttackCard,
	selectDefenseCard,
	showChoice,
	acceptEnd,
};

if (typeof window != 'undefined') {
	(window as any).memory = memory;
	(window as any).$memory = $store;
}
