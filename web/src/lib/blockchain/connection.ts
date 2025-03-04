import type {OriginAccount} from '@etherplay/connect';
import {createConnection} from '@etherplay/connect';
import type {EIP1193ProviderWithoutEvents, EIP1193SignerProvider} from 'eip-1193';
import {createStore} from '$utils/stores/utils';
import {JSONRPCHTTPProvider} from 'eip-1193-jsonrpc-provider';
import {EIP1193LocalSigner, wrapProviderWithLocalSigner} from 'eip-1193-signer';
import {entropyToMnemonic, mnemonicToSeedSync} from '@scure/bip39';
import {hexToBytes, bytesToHex} from '@noble/hashes/utils';
import {wordlist} from '@scure/bip39/wordlists/english';
import {initEmitter} from 'radiate';

export type Connection =
	| {
			providerWithoutSigner: undefined;
			chainId: undefined;
			genesisHash: undefined;
			providerWithSigner: undefined;
			address: undefined;
			mainAccount: undefined;
			email: undefined;
	  }
	| {
			providerWithoutSigner: EIP1193ProviderWithoutEvents;
			chainId: string;
			genesisHash: string;
			providerWithSigner: undefined;
			address: undefined;
			mainAccount: undefined;
			email: undefined;
	  }
	| {
			providerWithoutSigner: EIP1193ProviderWithoutEvents;
			chainId: string;
			genesisHash: string;
			providerWithSigner: EIP1193SignerProvider;
			address: `0x${string}`;
			mainAccount: `0x${string}`;
			email?: string;
	  };

export type SavedData = {
	email?: string;
	key: `0x${string}`;
	mainAccount: `0x${string}`;
};

function createSignerProvider(provider: EIP1193ProviderWithoutEvents, key: string) {
	const mnemonic = entropyToMnemonic(hexToBytes(key.slice(2)), wordlist);
	const signer = new EIP1193LocalSigner({mnemonic, num: 1});
	const signerProvider = wrapProviderWithLocalSigner(provider, signer);
	const address = signer.addresses[0];
	return {signerProvider, address};
}

const MY_KEY = '_my_key';

const etherplayConnection = createConnection({
	walletHost: 'https://accounts.etherplay.io',
});

export function initConnection() {
	let lastBlockNumberFetched: number = 0;
	const {$state, readable, set} = createStore<Connection>({
		providerWithoutSigner: undefined,
		chainId: undefined,
		genesisHash: undefined,
		providerWithSigner: undefined,
		address: undefined,
		mainAccount: undefined,
		email: undefined,
	});

	function loginWithEmail(): Promise<void> {
		const login = new Promise<OriginAccount>((resolve, reject) => {
			const unsubscribe = etherplayConnection.subscribe((v) => {
				if (v.step == 'SignedIn') {
					unsubscribe();
					resolve(v.account);
				} else if (v.error) {
					unsubscribe();
					reject(v.error);
				}
			});
			etherplayConnection.connect({type: 'email', email: undefined, mode: 'otp'});
		});

		return login.then((result) => {
			const currentProvider = $state.providerWithoutSigner;
			if (!currentProvider) {
				throw new Error(`Require a provider to send request to`);
			}

			const {signerProvider, address} = createSignerProvider(currentProvider, result.signer.mnemonicKey);

			localStorage.setItem(
				MY_KEY,
				JSON.stringify({
					email: result.metadata.email,
					key: result.signer.mnemonicKey,
					mainAccount: result.address,
				}),
			);
			set({
				providerWithSigner: signerProvider,
				address,
				email: result.metadata.email,
				mainAccount: result.address,
			});
		});
	}

	async function initProviderWithHTTPEndpoint(rpcURL: string) {
		if ($state.providerWithoutSigner) {
			return $state.providerWithoutSigner;
		}
		const provider = new JSONRPCHTTPProvider(rpcURL);
		const chainId = await provider.request({method: 'eth_chainId'});
		// TODO
		// const genesisBlock = await provider.request({method: 'eth_getBlockByNumber', params: [0, false]});
		lastBlockNumberFetched = 0;
		set({
			providerWithoutSigner: provider,
			chainId: Number(chainId).toString(),
			genesisHash: '', // genesisBlock?.hash || '',
		});
		pollLatestBlockAgainAndAgain();
		return provider;
	}

	let pollingTimer: NodeJS.Timeout | undefined;

	function stopPollingBlocks() {
		if (pollingTimer) {
			clearTimeout(pollingTimer);
			pollingTimer = undefined;
		}
	}

	async function pollLatestBlock() {
		const timerAtStart = pollingTimer;
		if ($state.providerWithoutSigner) {
			try {
				const block = await $state.providerWithoutSigner.request({
					method: 'eth_getBlockByNumber',
					params: ['latest', false],
				});
				if (pollingTimer === timerAtStart) {
					if (block && Number(block.number) > lastBlockNumberFetched) {
						lastBlockNumberFetched = Number(block.number);
						blockEmitter.emit(lastBlockNumberFetched);
					}
				}
			} catch (e) {
				console.error(`failed to poll block`, e);
			}
		}
	}

	function pollLatestBlockAgainAndAgain() {
		pollLatestBlock();
		pollingTimer = setTimeout(pollLatestBlockAgainAndAgain, 5000); // TODO interval config
	}

	async function initSignerFromLocalStorage() {
		const currentProvider = $state.providerWithoutSigner;
		if (!currentProvider) {
			throw new Error(`could not initalised provider`);
		}

		const fromStorageSTR = localStorage.getItem(MY_KEY);

		if (fromStorageSTR) {
			try {
				const fromStorage: SavedData = JSON.parse(fromStorageSTR);
				const {signerProvider, address} = createSignerProvider(currentProvider, fromStorage.key);
				set({
					providerWithoutSigner: currentProvider,
					providerWithSigner: signerProvider,
					address,
					mainAccount: fromStorage.mainAccount,
					email: fromStorage.email,
				});
				return {signerProvider, address};
			} catch (err) {
				const {signerProvider, address} = createSignerProvider(currentProvider, fromStorageSTR);
				set({
					providerWithoutSigner: currentProvider,
					providerWithSigner: signerProvider,
					address,
				});
				return {signerProvider, address};
			}
		}
	}

	function logout() {
		set({
			providerWithoutSigner: $state.providerWithoutSigner,
			providerWithSigner: undefined,
			address: undefined,
			mainAccount: undefined,
			email: undefined,
		});
	}

	const blockEmitter = initEmitter<number>();

	function onNewBlock(func: (blockNumber: number) => void) {
		return blockEmitter.on(func);
	}
	function offNewBlock(func: (blockNumber: number) => void) {
		return blockEmitter.off(func);
	}

	return {
		...readable,
		initProviderWithHTTPEndpoint,
		loginWithEmail,
		initSignerFromLocalStorage,
		logout,
		onNewBlock,
		offNewBlock,
	};
}
