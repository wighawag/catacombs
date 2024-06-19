import {browser} from '$app/environment';
import {page} from '$app/stores';
import {initConnection} from '$lib/blockchain/connection';
import {initContractState} from '$lib/blockchain/contractState';
import {defaultRPC} from '$lib/config';
import {createStore} from '$utils/stores/utils';
import {derived, get} from 'svelte/store';

export type Context = {context: 'loading' | 'introduction' | 'game'};

export type IntroductionState = {
	step: number;
};

async function start() {
	if (!defaultRPC?.url) {
		throw new Error(`no RPC URL provided`);
	}
	const provider = await connection.initProviderWithHTTPEndpoint(defaultRPC?.url);
	if (provider && browser) {
		await connection.initSignerFromLocalStorage();
	}
}

const connection = initConnection();

const contractState = initContractState(connection);

const introductionState = derived(page, ($page) => {
	const step = Number($page.url.hash ? $page.url.hash.slice('#introduction_'.length) || 0 : 0);
	return {
		step,
	} satisfies IntroductionState;
});

const {readable: context, $state: $context, set: setContext} = createStore<Context>({context: 'loading'});

const playerStatus = derived(
	[connection, contractState.status, contractState.state],
	([$connection, $contractStatus, $contractState]) => {
		if (!$connection.providerWithoutSigner) {
			return 'loading';
		}
		if (!$connection.providerWithSigner) {
			// we jump right into the introduction
			setContext({context: 'introduction'});
			return 'unconnected';
		}
		if ($contractStatus.state === 'IndexingLatest') {
			if ($contractState.controllers[$connection.address]) {
				if ($context.context === 'loading') {
					// we jump right into the game
					setContext({context: 'game'});
				}
				return 'in-game-already';
			} else {
				// we jump right into the introduction
				setContext({context: 'introduction'});
				return 'first-time';
			}
		} else {
			return 'catchingup';
		}
	},
);

start();

export {context, connection, contractState, playerStatus, introductionState};

if (typeof window != 'undefined') {
	(window as any).state = {context, connection, contractState, playerStatus, introductionState};
	(window as any).get = get;
}
