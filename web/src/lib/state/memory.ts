import {writable} from 'svelte/store';
import type {StateChanges} from './computedState';

export type Move = {
	position: {x: number; y: number};
	action: `0x${string}`;
};

export type MemoryState = {
	moves: Move[];
	stateChanges?: StateChanges;
};

const $store: MemoryState = {moves: []};
const store = writable<MemoryState>($store);

function addMove(move: Move, stateChanges: StateChanges) {
	$store.moves.push(move);
	$store.stateChanges = stateChanges;
	store.set($store);
}

function rewind() {
	$store.moves.splice(0, $store.moves.length);
	$store.stateChanges = undefined;
	store.set($store);
}

export const memory = {
	$store,
	subscribe: store.subscribe,
	addMove,
	rewind,
};

if (typeof window != 'undefined') {
	(window as any).memory = memory;
	(window as any).$memory = $store;
}
