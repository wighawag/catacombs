import {browser} from '$app/environment';
import {goto, replaceState} from '$app/navigation';
import {page} from '$app/stores';
import {initConnection} from '$lib/blockchain/connection';
import {initContractState} from '$lib/blockchain/contractState';
import {defaultRPC} from '$lib/config';
import {createStore} from '$utils/stores/utils';
import {derived, get} from 'svelte/store';

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

export type IntroductionState = {
	step: number;
};

const readableIntroductionState = derived(page, ($page) => {
	const step = Number($page.url.hash ? $page.url.hash.slice('#introduction_'.length) || 0 : 0);
	console.log({newSTEP: step});
	return {
		step,
	} satisfies IntroductionState;
});

const introductionState = {
	...readableIntroductionState,
	next() {
		const url = new URL(get(page).url);
		url.hash = `#introduction_${get(readableIntroductionState).step + 1}`;
		console.log({next: url});
		goto(url);
	},
	back(step?: number) {
		const url = new URL(get(page).url);
		url.hash = `#introduction_${step ? step : get(readableIntroductionState).step - 1}`;
		console.log({back: url});
		goto(url);
	},
};

export type Context = {context: 'loading' | 'start' | 'game'};

const {readable: context, $state: $context, set: setContext} = createStore<Context>({context: 'loading'});

const playerStatus = derived(
	[connection, contractState.status, contractState.state],
	([$connection, $contractStatus, $contractState]) => {
		if (!$connection.providerWithoutSigner) {
			return 'loading';
		}
		if (!$connection.providerWithSigner) {
			setContext({context: 'start'});
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
				setContext({context: 'start'});
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
