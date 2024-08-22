import {writable} from 'svelte/store';
import {currentFlow, type Flow, type Step} from '../flow';
import contracts from '$data/contracts';
import {createPublicClient, createWalletClient, custom, parseEther} from 'viem';
import {accountState, connection} from '$lib/state';
import {contractNetwork} from '$lib/blockchain/networks';

export type EnterState = {
	transaction?: {
		to: `0x${string}`;
		data: `0x${string}`;
		maxFeePerGas: bigint;
		maxPriorityFeePerGas: bigint;
		value: bigint;
	};

	txHash?: `0x${string}`;
};

export type EnterFlow = Flow<EnterState>;

export async function startEnter() {
	const {Characters, Game} = contracts.contracts;

	if (!connection.$state.providerWithSigner || !connection.$state.address) {
		throw new Error(`no provider `);
	}

	const publicClient = createPublicClient({
		transport: custom(connection.$state.providerWithoutSigner),
		chain: {
			id: Number(connection.$state.chainId),
			name: contractNetwork.$current.name,
			nativeCurrency: contractNetwork.$current.config.nativeCurrency || {
				decimals: 18,
				name: 'Ether',
				symbol: 'ETH',
			},
			rpcUrls: {
				default: {
					http: [],
				},
			},
		},
	});

	const walletClient = createWalletClient({
		account: connection.$state.address,
		transport: custom(connection.$state.providerWithSigner),
		chain: {
			id: Number(connection.$state.chainId),
			name: contractNetwork.$current.name,
			nativeCurrency: contractNetwork.$current.config.nativeCurrency || {
				decimals: 18,
				name: 'Ether',
				symbol: 'ETH',
			},
			rpcUrls: {
				default: {
					http: [],
				},
			},
		},
	});

	const steps: Step<EnterState>[] = [];

	const txStep = {
		title: 'Pay to Enter',
		action: 'OK',
		description: `Paying to Enter Ethernal`,
		// component: TransactionComponent,
		execute: async (state: EnterState) => {
			// const {transaction} = state;

			// if (!transaction) {
			// 	throw new Error(`did not record transaction`);
			// }

			const txDATA = {
				...Characters,
				functionName: 'mint',
				args: [Game.address, 1n], // 1n for first // TODO data not controlled, except name ?
				value: 0n, // parseEther('0.004'),
			} as const;

			const gasEstimate = await publicClient.estimateContractGas(txDATA);

			console.log({gasEstimate});

			const txHash = await walletClient.writeContract({...txDATA, gas: gasEstimate});
			// TODO track: accountState.onTxSent(txDATA, txHash);

			state.txHash = txHash;

			return {newState: state};
		},
	};
	steps.push(txStep);

	const flow: EnterFlow = {
		type: 'enter',
		currentStepIndex: writable(0),
		state: writable({}),
		completionMessage: 'Payment Complete.',
		steps,
	};
	currentFlow.start(flow);
}
