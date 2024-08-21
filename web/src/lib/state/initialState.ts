import {writable} from 'svelte/store';
import type {Context, StateChanges} from 'template-game-common';
import {evmGame} from './computed';
import {zeroAddress, zeroHash} from 'viem';

export type InitialState =
	| {stateChanges: undefined; context: undefined}
	| {
			stateChanges: StateChanges;
			context: Context;
	  };

const $store: InitialState = {stateChanges: undefined, context: undefined};
const store = writable<InitialState>($store);

// TODO derive from Indexed State => undefined | 'computing' | InitialState
// Context can also be computed from IndexedState but this can be instant (no computing needed)
// It cannot be computed from Indexed State directly as it depends on connected account

// NOTE: to manage multiple character, the initialState would be an array, same as context

export async function initialiseStateChanges() {
	// TODO fetch context or give it: Context will be taken from indexer
	const context = {
		// TODO context
		characterID: 1n,
		actions: [],
		controller: zeroAddress,
		epoch: 0,
		priorPosition: 0n,
		secret: zeroHash,

		priorGold: 0n,
		priorXP: 0,
		priorHP: 0,
		accessory1: 0n,
		accessory2: 0n,
		attackGear: 0n,
		defenseGear: 0n,
	};
	const initialStateChanges = await evmGame.initialStateChanges(context);

	$store.stateChanges = initialStateChanges;
	$store.context = context;
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
