import {writable} from 'svelte/store';

export type Move = {
	position: {x: number; y: number};
	action: `0x${string}`;
};

export type MemoryState = {
	moves: Move[];
};

const $store: MemoryState = {moves: []};
const store = writable<MemoryState>($store);

function addMove(move: Move) {
	$store.moves.push(move);
	store.set($store);
}

function rewind() {
	$store.moves.splice(0, $store.moves.length);
	store.set($store);
}

export const memory = {
	subscribe: store.subscribe,
	addMove,
	rewind,
};

if (typeof window != 'undefined') {
	(window as any).memory = memory;
	(window as any).$memory = $store;
}
