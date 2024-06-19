import {writable} from 'svelte/store';
import type {StateChanges} from 'template-game-common';
import {evmGame} from './computed';
import {zeroAddress, zeroHash} from 'viem';

export type InitialState = {
	stateChanges?: StateChanges;
};

const $store: InitialState = {stateChanges: undefined};
const store = writable<InitialState>($store);

export async function initialiseStateChanges() {
	const initialStateChanges = await evmGame.initialStateChanges({
		// TODO context
		characterID: 1n,
		actions: [],
		controller: zeroAddress,
		epoch: 0,
		priorPosition: 0n,
		secret: zeroHash,
	});

	$store.stateChanges = initialStateChanges;
	store.set($store);
	return initialStateChanges;
}

export const initialState = {
	$store,
	subscribe: store.subscribe,
};

initialiseStateChanges();

if (typeof window != 'undefined') {
	(window as any).initialState = initialState;
	(window as any).$initialState = $store;
}
