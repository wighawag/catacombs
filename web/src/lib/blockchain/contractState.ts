import {createProcessor} from 'template-game-indexer';
import {createIndexerState, keepStateOnIndexedDB, type IndexedStateLocation} from 'ethereum-indexer-browser';
import {initialContractsInfos, remoteIndexedState} from '$lib/config';
import type {EIP1193ProviderWithoutEvents} from 'eip-1193';
import {logs} from 'named-logs';
import {url} from '$utils/path';
import type {Connection} from './connection';
import type {Readable} from 'svelte/store';
import {browser} from '$app/environment';

const namedLogger = logs('state');

export function initContractState(connection: Readable<Connection>) {
	let _timeout: NodeJS.Timeout | undefined;
	let unsubscribeFromConnection: (() => void) | undefined;
	let _stopped: boolean = false;

	const processor = createProcessor();

	const embededIndexedState = {prefix: url(`/indexed-states/${initialContractsInfos.name}/`)};

	const indexedStateLocations: IndexedStateLocation[] = [embededIndexedState];

	if (remoteIndexedState) {
		indexedStateLocations.unshift({
			prefix: remoteIndexedState,
		});
	}

	/**
	 * We setup the indexer and make it process the event continuously once connected to the right chain
	 */
	const {state, syncing, status, init, indexMoreAndCatchupIfNeeded} = createIndexerState(processor, {
		trackNumRequests: true,
		// logRequests: true,
		keepState: keepStateOnIndexedDB('Game', indexedStateLocations) as any, // TODO types
	});

	console.log(`state`, state);

	async function indexIfNotIndexing() {
		await indexMoreAndCatchupIfNeeded();
	}

	async function indexContinuously(provider: EIP1193ProviderWithoutEvents) {
		if (_stopped) {
			return;
		}
		indexIfNotIndexing();
		if (!_timeout) {
			_timeout = setInterval(() => {
				indexIfNotIndexing();
			}, 5000); // TODO better : onNewBlock ?
		}
	}

	function initialize(provider: EIP1193ProviderWithoutEvents) {
		init({
			provider,
			source: {
				chainId: initialContractsInfos.chainId,
				contracts: Object.keys(initialContractsInfos.contracts).map(
					(name) => (initialContractsInfos as any).contracts[name],
				),
				genesisHash: initialContractsInfos.genesisHash,
			},
			config: {
				logLevel: 1,
			},
		}).then((v) => {
			namedLogger.log(`initialised`, v);
			if (browser) {
				indexContinuously(provider);
			}
		});
	}

	unsubscribeFromConnection = connection.subscribe(($connection) => {
		if ($connection.providerWithoutSigner) {
			initialize($connection.providerWithoutSigner);
		}
	});

	function stop() {
		_stopped = true;
		if (_timeout) {
			clearTimeout(_timeout);
			_timeout = undefined;
		}
		if (unsubscribeFromConnection) {
			try {
				unsubscribeFromConnection();
			} finally {
				unsubscribeFromConnection = undefined;
			}
		}
	}

	return {
		stop,
		state,
		syncing,
		status,
	};
}
