import {writable} from 'svelte/store';
import type {StateChanges} from 'template-game-common';

export type Move = {
	position: {x: number; y: number};
	action: `0x${string}`;
};

export type MemoryState = {
	moves: Move[];
	stateChanges: StateChanges[];
};

const $store: MemoryState = {moves: [], stateChanges: []};
const store = writable<MemoryState>($store);

function addMove(move: Move, stateChanges: StateChanges) {
	$store.moves.push(move);
	$store.stateChanges.push(stateChanges);
	store.set($store);
}

function reset() {
	$store.moves.splice(0, $store.moves.length);
	$store.stateChanges.splice(0, $store.stateChanges.length);
	store.set($store);
}

function rewind() {
	$store.moves.pop();
	$store.stateChanges.pop();
	store.set($store);
}

export const memory = {
	$store,
	subscribe: store.subscribe,
	addMove,
	rewind,
	reset,
};

if (typeof window != 'undefined') {
	(window as any).memory = memory;
	(window as any).$memory = $store;
}
