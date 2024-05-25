import {EVM} from '@ethereumjs/evm';
import {bytesToHex, hexToBytes} from '@ethereumjs/util';

export async function createEVMRunner({contracts}: {contracts: string}) {
	const evm = await EVM.create();
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
		// run
	};
}
