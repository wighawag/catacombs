import {writable} from 'svelte/store';
import type {StateChanges} from 'template-game-common';

export type Move = {
	position: {x: number; y: number};
	action: `0x${string}`;
};

export type MemoryState = {
	moves: Move[];
	stateChanges: StateChanges[];
	step: number;
	tutorialStep: number;
};

const $store: MemoryState = {moves: [], stateChanges: [], step: 0, tutorialStep: 0};
const store = writable<MemoryState>($store);

function addMove(move: Move, stateChanges: StateChanges) {
	$store.moves.push(move);
	$store.stateChanges.push(stateChanges);
	store.set($store);
}

function reset() {
	$store.moves.splice(0, $store.moves.length);
	$store.stateChanges.splice(0, $store.stateChanges.length);
	$store.step = 0;
	store.set($store);
}

function rewind() {
	$store.moves.pop();
	$store.stateChanges.pop();
	$store.step = 0;
	store.set($store);
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
