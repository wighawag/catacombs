import {loginPopup} from '@renraku/alchemy-login';
import type {EIP1193ProviderWithoutEvents, EIP1193SignerProvider} from 'eip-1193';
import {createStore} from '$utils/stores/utils';
import {JSONRPCHTTPProvider} from 'eip-1193-jsonrpc-provider';
import {wrapProviderWithLocalSigner} from 'eip-1193-signer';
import {entropyToMnemonic, mnemonicToSeedSync} from '@scure/bip39';
import {hexToBytes, bytesToHex} from '@noble/hashes/utils';
import {wordlist} from '@scure/bip39/wordlists/english';
import {browser} from '$app/environment';

export type Connection = {
	providerWithoutSigner?: EIP1193ProviderWithoutEvents;
	providerWithSigner?: EIP1193SignerProvider;
};

function createSignerProvider(provider: EIP1193ProviderWithoutEvents, key: string) {
	return wrapProviderWithLocalSigner(provider, {
		mnemonic: entropyToMnemonic(hexToBytes(key.slice(2)), wordlist),
		num: 1,
	});
}

const MY_KEY = '_my_key';

export function initConnection(rpcURL?: string) {
	const {$state, readable, set} = createStore<Connection>({});

	async function loginWithEmail() {
		const result = await loginPopup({
			walletHost: 'https://accounts.etherplay.io',
		});

		const currentProvider = $state.providerWithoutSigner;
		if (!currentProvider) {
			throw new Error(`Require a provider to send request to`);
		}

		const signerProvider = createSignerProvider(currentProvider, result.originAccount.mnemonicKey);

		localStorage.setItem(MY_KEY, result.originAccount.mnemonicKey);
		set({
			providerWithSigner: signerProvider,
		});
	}

	function initWithHTTPEndpoint() {
		if ($state.providerWithoutSigner) {
			return $state.providerWithoutSigner;
		}
		if (rpcURL) {
			const provider = new JSONRPCHTTPProvider(rpcURL);
			set({
				providerWithoutSigner: provider,
			});
			return provider;
		}
	}

	function initFromLocalStorage() {
		if (rpcURL) {
			let currentProvider = $state.providerWithoutSigner;
			if (!currentProvider) {
				currentProvider = initWithHTTPEndpoint();
			}
			if (!currentProvider) {
				throw new Error(`could not initalised provider`);
			}

			let signerProvider = $state.providerWithSigner;
			if (!signerProvider) {
				const fromStorage = localStorage.getItem(MY_KEY);
				if (fromStorage) {
					signerProvider = createSignerProvider(currentProvider, fromStorage);
				}
			}

			set({
				providerWithoutSigner: currentProvider,
				providerWithSigner: signerProvider,
			});
		}
	}

	if (browser) {
		initFromLocalStorage();
	}

	return {
		...readable,
		initWithHTTPEndpoint,
		loginWithEmail,
		initFromLocalStorage,
	};
}
