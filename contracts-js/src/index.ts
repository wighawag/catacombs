import {
	Abi,
	Contract,
	FormatAbi,
	MemoryClient,
	ReadActionCreator,
	createContract,
	createMemoryClient,
	formatAbi,
} from 'tevm';
import {Address, decodeDeployData} from 'viem';

export type GenericContractsInfosWithBytecodeAndConstructorData = {
	readonly [name: string]: {
		readonly abi: Abi;
		readonly bytecode: `0x${string}`;
		readonly argsData?: `0x${string}`;
	};
};

export type TEVMContracts<ContractsTypes extends GenericContractsInfosWithBytecodeAndConstructorData> = {
	[ContractName in Extract<keyof ContractsTypes, string>]: Contract<
		ContractName,
		FormatAbi<ContractsTypes[ContractName]['abi']>
	>;
};

export type TEVMReadContracts<ContractsTypes extends GenericContractsInfosWithBytecodeAndConstructorData> = {
	[ContractName in Extract<keyof ContractsTypes, string>]: {
		read: ReadActionCreator<
			FormatAbi<ContractsTypes[ContractName]['abi']>,
			Address,
			ContractsTypes[ContractName]['bytecode']
		>;
	};
};

function deployContract(
	client: MemoryClient,
	name: string,
	abi: Abi,
	bytecode: `0x${string}`,
	argsData?: `0x${string}`,
) {
	return client
		.tevmDeploy({
			abi,
			bytecode,
			args: argsData
				? decodeDeployData({
						abi,
						bytecode,
						data: argsData,
					})
				: undefined,
		})
		.then((results: any) => {
			if (results.createdAddress == null) {
				throw new Error(`could not deploy contract ${name}`);
			}
			return createContract({
				name,
				humanReadableAbi: formatAbi(abi),
				address: results.createdAddress,
				bytecode: bytecode,
			});
		});
}

export function createTEVMContracts<ContractsTypes extends GenericContractsInfosWithBytecodeAndConstructorData>(
	contracts: ContractsTypes,
): {contracts: TEVMReadContracts<ContractsTypes>; client: MemoryClient} {
	const evm = createMemoryClient();

	const tevmContracts: TEVMReadContracts<ContractsTypes> = {} as TEVMReadContracts<ContractsTypes>;
	const contractNames = Object.keys(contracts);
	for (const contractName of contractNames) {
		const {abi, bytecode, argsData} = contracts[contractName];
		const deployedContract = deployContract(evm, contractName, abi, bytecode, argsData);
		(tevmContracts as any)[contractName] = {
			read: async (...args: any[]) => deployedContract.then((v: any) => v.read(...args)),
		};
	}
	return {contracts: tevmContracts, client: evm};
}
