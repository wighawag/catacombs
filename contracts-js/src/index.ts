import {EVM} from '@ethereumjs/evm';
import {Address, bytesToHex, hexToBytes} from '@ethereumjs/util';

export async function createEVMRunner(contracts: {[id: string]: {bytecode: `0x${string}`; argsData?: `0x${string}`}}) {
	const evm = await EVM.create();
	const contractNames = Object.keys(contracts);
	const contractAddresses: {[name: string]: `0x${string}`} = {};
	for (const contractName of contractNames) {
		const {bytecode, argsData} = contracts[contractName];
		const results = await evm.runCall({
			data: hexToBytes(bytecode + (argsData ? argsData.slice(2) : '')),
		});
		if (!results.createdAddress) {
			throw new Error(`could not deploy contract ${contractName}`);
		}
		const contractAddress = results.createdAddress?.toString() as `0x${string}`;
		contractAddresses[contractName] = contractAddress;
	}

	async function runContract(name: string, data: `0x${string}`) {
		const contractAddress = contractAddresses[name];
		const results = await evm.runCall({
			to: Address.fromString(contractAddress),
			data: hexToBytes(data),
		});

		return bytesToHex(results.execResult.returnValue) as `0x${string}`;
	}

	async function runCode(code: `0x${string}`) {
		return evm
			.runCode({
				code: hexToBytes(code),
				gasLimit: BigInt(0xffff),
			})
			.then((results) => {
				return bytesToHex(results.returnValue) as `0x${string}`;
			});
	}
	return {
		runCode,
		runContract,
	};
}
