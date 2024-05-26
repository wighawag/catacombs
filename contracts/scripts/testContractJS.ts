import {createEVMRunner} from 'template-game-contracts-js';
import {encodeFunctionData} from 'viem';

const abi = [
	{
		inputs: [
			{
				internalType: 'int32',
				name: 'x',
				type: 'int32',
			},
			{
				internalType: 'int32',
				name: 'y',
				type: 'int32',
			},
		],
		name: 'areaAt',
		outputs: [
			{
				components: [
					{
						internalType: 'uint128',
						name: 'eastWalls',
						type: 'uint128',
					},
					{
						internalType: 'uint128',
						name: 'southWalls',
						type: 'uint128',
					},
				],
				internalType: 'struct Game.Area',
				name: 'area',
				type: 'tuple',
			},
		],
		stateMutability: 'pure',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'bytes32',
				name: 'areaHash',
				type: 'bytes32',
			},
		],
		name: 'computeArea',
		outputs: [
			{
				components: [
					{
						internalType: 'uint128',
						name: 'eastWalls',
						type: 'uint128',
					},
					{
						internalType: 'uint128',
						name: 'southWalls',
						type: 'uint128',
					},
				],
				internalType: 'struct Game.Area',
				name: '',
				type: 'tuple',
			},
		],
		stateMutability: 'pure',
		type: 'function',
	},
] as const;

async function main() {
	const evm = await createEVMRunner({
		GameUtils: {
			bytecode:
				'0x6080806040523460195761023f908161001e823930815050f35b5f80fdfe60806040526004361015610011575f80fd5b5f3560e01c8063751846b8146100a15763c3ba14301461002f575f80fd5b60207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261009d5761009961006760043561018e565b6040519182918291909160206040820193816fffffffffffffffffffffffffffffffff91828151168552015116910152565b0390f35b5f80fd5b60407ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261009d576004358060030b80910361009d57602435908160030b80920361009d575f60206100f3610141565b8281520152818102918183041490151715610114576100676100999161018e565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b604051906040820182811067ffffffffffffffff82111761016157604052565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b6003905f602061019c610141565b8281520152166101d6576101ae610141565b6f182304008c112204628451882104208081526b03bf00d000000f001003fb80602082015290565b6101de610141565b6f04608c018230460a500a08042084108081526e1b800000003dbc0781fd000003fb8060208201529056fea26469706673582212205d432740d278044e6111b679887fc0c0cad3ea325029db267558199eff37fd1f64736f6c63430008190033',
		},
	});

	const result = await evm.runContract(
		'GameUtils',
		encodeFunctionData({
			abi,
			functionName: 'areaAt',
			args: [0, 0],
		}),
	);

	console.log(result);
}
main();
