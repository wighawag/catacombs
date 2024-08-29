import {browser} from '$app/environment';
import {goto} from '$app/navigation';
import {page} from '$app/stores';
import {defaultRPC} from '$lib/config';
import {createStore} from '$utils/stores/utils';
import {derived, get} from 'svelte/store';
import {initTransactionProcessor} from 'ethereum-tx-observer';
import type {EIP1193Provider} from 'eip-1193';
import {stringToHex} from 'viem';
import {connection} from './connection';
import {contractState} from './IndexedState';
import {accountState} from './AccountState';
import {initInitialStateChanges} from './InitialStateChanges';
import {connectedState} from './ConnectedState';

const initialStateChanges = initInitialStateChanges(connectedState, accountState);

async function start() {
	if (!defaultRPC?.url) {
		throw new Error(`no RPC URL provided`);
	}
	const provider = await connection.initProviderWithHTTPEndpoint(defaultRPC?.url);
	if (provider && browser) {
		await connection.initSignerFromLocalStorage();
	}
}

const txObserver = initTransactionProcessor({finality: 12}); // TODO config.finality

// we hook up accountData and txObserver
// they do not need to know about each other
// except that account data follow the same type of "pending tx" as input/output
// but accountData can be strucutred as it wishes otherwise. just need to emit an event for "clear" and "newTx"
// load and unload need to be called when connection signer changes
accountState.on((event) => {
	switch (event.name) {
		case 'clear':
			txObserver.clear();
			break;
		case 'newTx':
			txObserver.add(event.txs);
			break;
	}
});
txObserver.onTx((v) => {
	// logger.info(`onTx ${v.hash}`);
	accountState.updateTx(v);
});
// TODO
connection.onNewBlock(() => {
	// logger.info(`onNewBlock`);
	txObserver.process();
});

async function loadAccount(
	address: `0x${string}`,
	chainId: string,
	genesisHash: string,
	signature: Promise<`0x${string}`>,
) {
	const sig = signature ? await signature : undefined;
	return accountState.load({
		address,
		chainId,
		genesisHash,
		localKey: sig ? (sig.slice(0, 66) as `0x${string}`) : undefined,
	});
}
connection.subscribe(($connection) => {
	if ($connection.providerWithoutSigner) {
		txObserver.setProvider($connection.providerWithoutSigner as EIP1193Provider); // TODO txObserver do not need events
	}
	if ($connection.providerWithSigner) {
		const msg = stringToHex(
			'Welcome to Catacombs, Please sign this message only on trusted frontend. This gives access to your local data that you are supposed to keep secret.',
		);
		const signature = $connection.providerWithSigner.request({
			method: 'personal_sign',
			params: [msg, $connection.address],
		});
		if (accountState.address) {
			if ($connection.address != accountState.address || $connection.chainId != accountState.chainId) {
				accountState.unload().then(() => {
					loadAccount($connection.address, $connection.chainId, $connection.genesisHash, signature);
				});
			}
		} else {
			loadAccount($connection.address, $connection.chainId, $connection.genesisHash, signature);
		}
	} else {
		if (accountState.address) {
			accountState.unload();
		}
	}
});

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
	clear() {
		const url = new URL(get(page).url);
		url.hash = ``;
		goto(url);
	},
};

export type Context = {context: 'loading' | 'start' | 'game'};

const {readable: readableContext, $state: $context, set: setContext} = createStore<Context>({context: 'loading'});

const context = {
	...readableContext,
	gotoGameScreen() {
		setContext({
			context: 'game',
		});
	},
	gotoIntro() {
		setContext({
			context: 'start',
		});
	},
};

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
		// TODO reenable once we get the mint
		if ($contractStatus.state === 'IndexingLatest') {
			if ($contractState.controllers[$connection.address.toLowerCase() as `0x${string}`]) {
				if ($context.context === 'loading' || $context.context === 'start') {
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

export {setContext};

export {context, playerStatus, introductionState, initialStateChanges};

start();

if (typeof window != 'undefined') {
	(window as any).state = {context, playerStatus, introductionState};
	(window as any).get = get;
}
