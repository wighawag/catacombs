import {writable} from 'svelte/store';
import {currentFlow, type Flow, type Step} from '../flow';
import contracts from '$data/contracts';
import {createPublicClient, createWalletClient, custom, keccak256} from 'viem';
import {contractNetwork} from '$lib/blockchain/networks';
import {connection} from '$lib/state/connection';
import {createTransactionRequest} from '$utils/ethereum/transaction';
import {accountState} from '$lib/state/AccountState';
import {getRoughGasPriceEstimate} from '$utils/ethereum/gas';

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

			if (!connection.$state.address) {
				throw new Error(`no account`);
			}

			const transactionRequestWithoutGasPricing = await createTransactionRequest(
				connection.$state.providerWithoutSigner,
				{
					...Characters,
					account: connection.$state.address,
					functionName: 'mint',
					args: [Game.address, 1n], // 1n for first // TODO data not controlled, except name ?
					value: 0n, // parseEther('0.004'),
					chainId: connection.$state.chainId,
				},
			);

			const gasPriceEstimate = await getRoughGasPriceEstimate(connection.$state.providerWithoutSigner);

			const transactionRequest = {
				...transactionRequestWithoutGasPricing,
				maxFeePerGas: `0x${gasPriceEstimate.fast.maxFeePerGas.toString(16)}` as `0x${string}`,
				maxPriorityFeePerGas: `0x${gasPriceEstimate.fast.maxPriorityFeePerGas.toString(16)}` as `0x${string}`,
			};

			const rawTransaction = await connection.$state.providerWithSigner.request({
				method: 'eth_signTransaction',
				params: [transactionRequest],
			});

			const txHash = keccak256(rawTransaction);

			state.txHash = txHash;

			console.log(`asuming all goes `);

			accountState.onTxSent(
				{
					...transactionRequest,
					metadata: {
						type: 'enter',
					},
				},
				txHash,
			);

			const txHashBroadcasted = await connection.$state.providerWithoutSigner.request({
				method: 'eth_sendRawTransaction',
				params: [rawTransaction],
			});

			if (txHashBroadcasted != txHash) {
				console.error(`mismatch TX HASH`, {txHash}, {txHashBroadcasted});
			}

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
