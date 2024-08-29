import type {EIP1193ProviderWithoutEvents, EIP1193TransactionDataOfType2} from 'eip-1193';
import {encodeFunctionData, type Abi, type ContractFunctionName, type EncodeFunctionDataParameters} from 'viem';

export async function createTransactionRequest<
	const abi extends Abi | readonly unknown[],
	functionName extends ContractFunctionName<abi> | undefined = undefined,
>(
	provider: EIP1193ProviderWithoutEvents,
	parameters: EncodeFunctionDataParameters<abi, functionName> & {
		chainId: string;
		address: `0x${string}`;
		account: `0x${string}`;
		value: bigint;
	},
): Promise<EIP1193TransactionDataOfType2> {
	const data = encodeFunctionData(parameters as any);

	const txForEstimate: EIP1193TransactionDataOfType2 = {
		type: '0x2',
		to: parameters.address,
		data,
		from: parameters.account,
		value: '0x0', // parseEther('0.004').toString(),
	};

	const gasHex = await provider.request({method: 'eth_estimateGas', params: [txForEstimate]});
	const gas = `0x${(Number(gasHex) + 10000).toString(16)}` as `0x${string}`;
	const nonce = await provider.request({method: 'eth_getTransactionCount', params: [parameters.account]});

	const tx: EIP1193TransactionDataOfType2 = {
		...txForEstimate,
		gas,
		nonce,
		chainId: parameters.chainId ? `0x${Number(parameters.chainId).toString(16)}` : undefined,
	};

	return tx;
}
