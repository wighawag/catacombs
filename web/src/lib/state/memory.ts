import {setInitialCamera} from '$lib/tutorial';
import {writable} from 'svelte/store';
import type {StateChanges} from 'template-game-common';

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
	step: number;
	tutorialStep: number;
};

const $store: MemoryState = {moves: [], stateChanges: [], step: 0, tutorialStep: 0, stateChangesTimestamp: 0};
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
	$store.step = 0;
	$store.tutorialStep = 0;
	setInitialCamera();
	store.set($store);
	return true;
}

function rewind() {
	if ($store.stateChanges.length == 0) {
		return false;
	}
	$store.moves.pop();
	$store.step = 0;
	$store.stateChangesTimestamp = 0; // TODO allow rewind anim too
	$store.stateChanges.pop();
	if ($store.stateChanges.length == 0) {
		$store.tutorialStep = 0;
		setInitialCamera();
	}
	store.set($store);
	return true;
}

function next() {
	$store.step++;
	store.set($store);
}

function tutorialNext() {
	$store.tutorialStep++;
	store.set($store);
}

export const memory = {
	$store,
	subscribe: store.subscribe,
	addMove,
	rewind,
	reset,
	next,
	tutorialNext,
};

if (typeof window != 'undefined') {
	(window as any).memory = memory;
	(window as any).$memory = $store;
}
