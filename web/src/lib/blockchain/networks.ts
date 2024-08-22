import {derived, get, readable, type Readable} from 'svelte/store';
import type {ChainInfo} from '@rocketh/export';

import _contractsInfos from '$data/contracts';

export type NetworkConfig = typeof _contractsInfos;
export const initialContractsInfos = _contractsInfos;

let _setContractsInfos: any;
export const contractsInfos = readable<NetworkConfig>(_contractsInfos, (set) => {
	_setContractsInfos = set;
});

export function _asNewModule(set: any) {
	_setContractsInfos = set;
}

if (import.meta.hot) {
	import.meta.hot.accept((newModule) => {
		newModule?._asNewModule(_setContractsInfos);
		_setContractsInfos(newModule?.initialContractsInfos);
	});
}

export type NetworkWalletData = {
	readonly rpcUrls?: readonly string[];
	readonly blockExplorerUrls?: readonly string[];
	readonly chainName?: string;
	readonly iconUrls?: readonly string[];
	readonly nativeCurrency?: {
		name: string;
		symbol: string;
		decimals: number;
	};
};
export type NetworkData = {
	config: NetworkWalletData;
	finality: number;
	averageBblockTime: number;
};

export function getWalletSwitchChainInfo(chainInfo: ChainInfo): NetworkWalletData {
	return {
		rpcUrls: chainInfo.rpcUrls.default.http,
		blockExplorerUrls: chainInfo.blockExplorers?.default.url ? [chainInfo.blockExplorers?.default.url] : undefined,
		chainName: chainInfo.name,
		nativeCurrency: chainInfo.nativeCurrency,
	};
}

export const initialNetworkConfig = getWalletSwitchChainInfo(initialContractsInfos.chainInfo);
export const initialNetworkName = initialNetworkConfig?.chainName || `Chain with id: ${initialContractsInfos.chainId}`;

export type ContractNetwork = {
	config: NetworkWalletData;
	name: string;
	chainId: string;
};

function getNetworkData<ContractsInfos extends {chainId: string; chainInfo: ChainInfo}>(
	$contractsInfos: ContractsInfos,
) {
	const chainId = $contractsInfos.chainId;
	const chainInfo = $contractsInfos.chainInfo;
	const config = getWalletSwitchChainInfo(chainInfo);
	const data = {
		config,
		name: config?.chainName || `Chain with id: ${chainId}`,
		chainId,
	};
	return data;
}

export const contractNetwork: Readable<ContractNetwork> & {
	$current: ContractNetwork;
} = derived([contractsInfos], ([$contractsInfos]) => {
	const data = getNetworkData($contractsInfos);
	contractNetwork.$current = data;
	return data;
}) as Readable<ContractNetwork> & {
	$current: ContractNetwork;
};
contractNetwork.$current = getNetworkData(initialContractsInfos);

// GameConfig parsed:
export type GameConfig = Omit<
	typeof initialContractsInfos.contracts.Game.linkedData,
	'revealPhaseDuration' | 'commitPhaseDuration' | 'startTime'
> & {
	revealPhaseDuration: number;
	commitPhaseDuration: number;
	startTime: number;
};
function transformGameConfig(data: typeof initialContractsInfos.contracts.Game.linkedData) {
	const newValue = {
		...data,
		revealPhaseDuration: Number(data.revealPhaseDuration.slice(0, -1)),
		commitPhaseDuration: Number(data.revealPhaseDuration.slice(0, -1)),
		startTime: Number(data.startTime.slice(0, -1)),
	};
	return newValue;
}
export const gameConfig: Readable<GameConfig> & {
	$current: GameConfig;
} = derived([contractsInfos], ([$contractsInfos]) => {
	const newValue = transformGameConfig($contractsInfos.contracts.Game.linkedData);
	gameConfig.$current = newValue;
	return newValue;
}) as Readable<GameConfig> & {
	$current: GameConfig;
};
gameConfig.$current = transformGameConfig(initialContractsInfos.contracts.Game.linkedData);
