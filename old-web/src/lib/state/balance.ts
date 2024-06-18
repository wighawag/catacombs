import {blockTime, initialContractsInfos} from '$lib/config';
import type {EIP1193ProviderWithoutEvents} from 'eip-1193';
import {writable, type Readable} from 'svelte/store';
import {zeroAddress, type Address, encodeFunctionData, parseEther, decodeFunctionResult} from 'viem';
import type {AccountState, ConnectionState} from 'web3-connection';
import {connection, account} from '$lib/blockchain/connection';

export type BalanceData = {
	state: 'Idle' | 'Loaded';
	fetching: boolean;
	nativeBalance: bigint;
	globalApprovalForGame: boolean;
	reserve: bigint;
	account?: Address;
};

export function initBalance({
	connection,
	account,
}: {
	connection: Readable<ConnectionState>;
	account: Readable<AccountState<Address>>;
}) {
	const $state: BalanceData = {
		state: 'Idle',
		fetching: false,
		nativeBalance: 0n,
		globalApprovalForGame: false,
		reserve: 0n,
	};

	let cancelAccountSubscription: (() => void) | undefined = undefined;
	let cancelConnectionSubscription: (() => void) | undefined = undefined;
	function stop() {
		if (cancelAccountSubscription) {
			cancelAccountSubscription();
			cancelAccountSubscription = undefined;
		}
		if (cancelConnectionSubscription) {
			cancelConnectionSubscription();
			cancelConnectionSubscription = undefined;
		}
	}

	let provider: EIP1193ProviderWithoutEvents | undefined;

	async function fetchBalance(account: Address) {
		if ($state.account !== account) {
			return;
		}
		if (provider) {
			$state.fetching = true;
			store.set($state);
			try {
				let reserve: string = '0x0';
				// if (depositContract) {
				// 	reserve = await provider.request({
				// 		method: 'eth_call',
				// 		params: [
				// 			{
				// 				to: depositContract,
				// 				data: encodeFunctionData({
				// 					abi: [
				// 						{
				// 							type: 'function',
				// 							name: 'getReserve',
				// 							inputs: [{type: 'address'}],
				// 							outputs: [{type: 'uint56'}],
				// 						},
				// 					],
				// 					args: [account],
				// 					functionName: 'getReserve',
				// 				}),
				// 			},
				// 			'latest',
				// 		],
				// 	});
				// }
				const nativeBalance = await provider.request({method: 'eth_getBalance', params: [account, 'latest']});

				let globalApprovalForGame = false;
				
				if ($state.account !== account) {
					return;
				}
				$state.nativeBalance = BigInt(nativeBalance);
				$state.globalApprovalForGame = globalApprovalForGame;
				$state.reserve = BigInt(reserve);
				$state.state = 'Loaded';
				$state.fetching = false;
				store.set($state);
			} catch (e: any) {
				console.error(e);
				$state.fetching = false;
				store.set($state);
			} finally {
				// we keep fetching
				// TODO use chain tempo
				setTimeout(() => fetchBalance(account), blockTime * 1000);
			}
		}
	}

	function start(set: (data: BalanceData) => void) {
		cancelAccountSubscription = account.subscribe(($account) => {
			if ($state.account !== $account.address) {
				$state.account = $account.address;
				$state.state = 'Idle';
				$state.nativeBalance = 0n;
				$state.reserve = 0n;
				store.set($state);
				if ($account.address) {
					fetchBalance($account.address);
				}
			}
		});

		cancelConnectionSubscription = connection.subscribe(($connection) => {
			if (provider !== $connection.provider) {
				provider = $connection.provider;
				if ($state.account) {
					fetchBalance($state.account);
				}
			}
		});

		return stop;
	}

	const store = writable($state, start);

	return {
		subscribe: store.subscribe,
	};
}

export const balance = initBalance({
	connection,
	account,
});

// TODO per chain
// like other things
export const MINIMUM_REQUIRED_ETH_BALANCE = parseEther('0.0002');
