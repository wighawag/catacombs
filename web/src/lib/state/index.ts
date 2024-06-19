import {page} from '$app/stores';
import {initConnection} from '$lib/blockchain/connection';
import {initContractState} from '$lib/blockchain/contractState';
import {defaultRPC} from '$lib/config';
import {createStore} from '$utils/stores/utils';
import type {StatusState} from 'ethereum-indexer-browser';
import {derived, writable, type Readable} from 'svelte/store';
import type {Data} from 'template-game-indexer';

export const connection = initConnection(defaultRPC?.url);

export const contractState = initContractState(connection);

export type IntroductionState = {
	step: number;
};
export const introductionState = derived(page, ($page) => {
	const step = Number($page.url.hash ? $page.url.hash.slice('#introduction_'.length) || 0 : 0);
	return {
		step,
	} satisfies IntroductionState;
});

export type GameState = {
	loaded: boolean;
	character: boolean;
};

export const {readable: gameState} = createStore<GameState>({
	loaded: false,
	character: false,
});

export type Context = {
	context: 'loading' | 'introduction' | 'game';
};
export const {readable: currentContext} = createStore<Context>({context: 'loading'});

function initContext(indexingStatus: Readable<StatusState>, contractState: Readable<Data>) {
	const unsubscribeFromIndexingStatus = indexingStatus.subscribe(($status) => {
		// if ($status)
	});

	const unsubscribeFromContractState = contractState.subscribe(($state) => {});

	function stop() {}
	return {
		stop,
	};
}
