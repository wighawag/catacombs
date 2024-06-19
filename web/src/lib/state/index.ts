import {browser} from '$app/environment';
import {page} from '$app/stores';
import {initConnection} from '$lib/blockchain/connection';
import {initContractState} from '$lib/blockchain/contractState';
import {defaultRPC} from '$lib/config';
import {createStore} from '$utils/stores/utils';
import {derived} from 'svelte/store';

export const connection = initConnection();

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

export async function start() {
	if (!defaultRPC?.url) {
		throw new Error(`no RPC URL provided`);
	}
	const provider = await connection.initProviderWithHTTPEndpoint(defaultRPC?.url);
	if (provider && browser) {
		await connection.initSignerFromLocalStorage();
	}
}

export type Context = {context: 'loading' | 'introduction' | 'game'};

const {readable: context, $state: $context, set: setContext} = createStore<Context>({context: 'loading'});

export {context};

export const playerStatus = derived(
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
