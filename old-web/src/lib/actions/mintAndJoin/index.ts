import {writable} from 'svelte/store';
import {currentFlow, type Flow, type Step} from '../flow';
import {viemClient} from '$lib/blockchain/connection';
import {encodeFunctionData, zeroAddress} from 'viem';
import NotEnoughEthComponent from './NotEnoughEthComponent.svelte';
import {getRoughGasPriceEstimate} from '$utils/ethereum/gas';
import type {MintAndJoinMetadata} from '$lib/account/account-data';
import TransactionFailsComponent from './TransactionFailsComponent.svelte';

export type MintAndJoinState = {
	transaction?: {
		to: `0x${string}`;
		data: `0x${string}`;
		maxFeePerGas: bigint;
		maxPriorityFeePerGas: bigint;
		value: bigint;
	};

	metadata?: MintAndJoinMetadata;

	balanceData?: {
		nativeToken: bigint;
		amountRequired: bigint;
	};

	txHash?: `0x${string}`;

	error?: string;
};

export type MintAndJoinFlow = Flow<MintAndJoinState>;

export async function start() {
	await viemClient.execute(async ({client, account, connection, network: {contracts}}) => {
		const {Game, Characters} = contracts;

		const steps: Step<MintAndJoinState>[] = [];

		const gatheringInfoStep = {
			title: 'Gathering Info',
			description: `Gather the Necessary Information to Perform the Commit`,
			execute: async (state: MintAndJoinState) => {
				const value = 0n; // TODO price ?
				console.log(`getting balance...`);
				const balanceETH = await client.public.getBalance({
					address: account.address,
				});

				// ----------------------------------------------------------------------------------------
				// Gather the various fees and gas prices
				// ----------------------------------------------------------------------------------------
				console.log(`estimating gas prices...`);
				// let {maxFeePerGas, maxPriorityFeePerGas, gasPrice} = await client.public.estimateFeesPerGas({
				// 	type: 'eip1559',
				// });
				const estimates = await getRoughGasPriceEstimate(connection.provider);
				let {maxFeePerGas, maxPriorityFeePerGas} = estimates.average;
				const gasPrice = estimates.gasPrice;

				if (maxFeePerGas === undefined || !maxPriorityFeePerGas === undefined) {
					throw new Error(`could not get gas price`);
				}

				let transactionData: {data: `0x${string}`; gasEstimate: bigint; extraFee: bigint};

				const characterID = 1n;

				console.log(`preparing tx data...`);
				const params = {
					...Characters,
					functionName: 'mint',
					args: [Game.address, 1n],
					// args: [characterID, zeroAddress],
					account: account.address,
				} as const;

				let gasEstimate: bigint;
				try {
					gasEstimate = await client.public.estimateContractGas({
						...params,
						// value: 1n, // fake to wirk even if not enough ETH
					});
				} catch (err) {
					state.error = err as string;
					return {
						newState: state,
						nextStep: 1,
					};
				}
				const data = encodeFunctionData({
					...params,
				});
				let extraFee: bigint = 0n;
				if ('estimateContractL1Fee' in client.public) {
					const l1Fee = await client.public.estimateContractL1Fee({
						...params,
						// value, // fake to work even if not enough ETH
					});
					extraFee = l1Fee;
				}

				transactionData = {
					data,
					gasEstimate,
					extraFee,
				};
				state.transaction = {
					data: transactionData.data,
					to: Characters.address,
					value: 0n,
					maxFeePerGas,
					maxPriorityFeePerGas,
				};
				state.metadata = {
					type: 'mintAndJoin',
					characterID: characterID.toString(),
				};

				state.balanceData = {
					nativeToken: balanceETH,
					amountRequired: (transactionData.gasEstimate + 20000n) * maxFeePerGas + transactionData.extraFee + value,
				}; // TODO

				const enoughETH = state.balanceData.nativeToken >= state.balanceData.amountRequired;
				if (!enoughETH) {
					console.error(`not enough eth`);
				}

				return {
					newState: state,
					nextStep: enoughETH ? 3 : 2,
				};
			},
		};
		steps.push(gatheringInfoStep);

		const transactionFailsStep = {
			title: 'The Transaction fails',
			action: 'OK',
			description: `Failed to estimate gas`,
			component: TransactionFailsComponent,
			end: true,
			execute: async (state: MintAndJoinState) => {
				return {newState: state, nextStep: 4};
			},
		};
		steps.push(transactionFailsStep);

		const notEnoughETHStep = {
			title: 'You dont have enough ETH',
			action: 'OK',
			description: `You need more ETH to proceed`,
			component: NotEnoughEthComponent,
			end: true,
			execute: async (state: MintAndJoinState) => {
				return {newState: state, nextStep: 4};
			},
		};
		steps.push(notEnoughETHStep);

		const txStep = {
			title: 'Enter The Catacombs',
			action: 'OK',
			description: `....`,
			// component: TransactionComponent,
			execute: async (state: MintAndJoinState) => {
				const {transaction, metadata} = state;

				if (!transaction) {
					throw new Error(`did not record transaction`);
				}

				connection.provider.setNextMetadata(metadata);
				const txHash = await client.wallet.sendTransaction(transaction);

				state.txHash = txHash;

				return {newState: state};
			},
		};
		steps.push(txStep);

		const flow: MintAndJoinFlow = {
			type: 'mintAndJoin',
			currentStepIndex: writable(0),
			state: writable({}),
			completionMessage: 'Your character is on its way.',
			steps,
		};
		currentFlow.start(flow);
	});
}
