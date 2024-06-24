import {loginPopup} from '@renraku/alchemy-login';
import type {EIP1193ProviderWithoutEvents, EIP1193SignerProvider} from 'eip-1193';
import {createStore} from '$utils/stores/utils';
import {JSONRPCHTTPProvider} from 'eip-1193-jsonrpc-provider';
import {EIP1193LocalSigner, wrapProviderWithLocalSigner} from 'eip-1193-signer';
import {entropyToMnemonic, mnemonicToSeedSync} from '@scure/bip39';
import {hexToBytes, bytesToHex} from '@noble/hashes/utils';
import {wordlist} from '@scure/bip39/wordlists/english';

export type Connection =
	| {
			providerWithoutSigner: undefined;
			providerWithSigner: undefined;
			address: undefined;
			mainAccount: undefined;
			email: undefined;
	  }
	| {
			providerWithoutSigner: EIP1193ProviderWithoutEvents;
			providerWithSigner: undefined;
			address: undefined;
			mainAccount: undefined;
			email: undefined;
	  }
	| {
			providerWithoutSigner: EIP1193ProviderWithoutEvents;
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

export function initConnection() {
	const {$state, readable, set} = createStore<Connection>({
		providerWithoutSigner: undefined,
		providerWithSigner: undefined,
		address: undefined,
		mainAccount: undefined,
		email: undefined,
	});

	async function loginWithEmail() {
		const result = await loginPopup({
			walletHost: 'https://accounts.etherplay.io',
		});

		const currentProvider = $state.providerWithoutSigner;
		if (!currentProvider) {
			throw new Error(`Require a provider to send request to`);
		}

		const {signerProvider, address} = createSignerProvider(currentProvider, result.originAccount.mnemonicKey);

		localStorage.setItem(
			MY_KEY,
			JSON.stringify({
				email: result.email,
				key: result.originAccount.mnemonicKey,
				mainAccount: result.localAccount.address,
			}),
		);
		set({
			providerWithSigner: signerProvider,
			address,
			email: result.email,
			mainAccount: result.localAccount.address,
		});
	}

	async function initProviderWithHTTPEndpoint(rpcURL: string) {
		if ($state.providerWithoutSigner) {
			return $state.providerWithoutSigner;
		}
		const provider = new JSONRPCHTTPProvider(rpcURL);
		set({
			providerWithoutSigner: provider,
		});
		return provider;
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

	return {
		...readable,
		initProviderWithHTTPEndpoint,
		loginWithEmail,
		initSignerFromLocalStorage,
		logout,
	};
}
