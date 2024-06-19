import {browser, version} from '$app/environment';
import {dev as devEnvironment} from '$app/environment';

import {getParamsFromLocation, getHashParamsFromLocation} from '$utils/url';
import {
	PUBLIC_ETH_NODE_URI_LOCALHOST,
	PUBLIC_ETH_NODE_URI,
	PUBLIC_LOCALHOST_BLOCK_TIME,
	PUBLIC_DEV_NODE_URI,
	PUBLIC_SYNC_URI,
	PUBLIC_FUZD_URI,
	PUBLIC_SNAPSHOT_URI,
	PUBLIC_MISSIV_URI,
} from '$env/static/public';

import {initialContractsInfos, contractsInfos} from './blockchain/networks';
import {LocalCache} from '$utils/localCache';

export const globalQueryParams = [
	'debug',
	'log',
	'ethnode',
	'_d_eruda',
	'dev',
	'ethnode',
	'sync',
	'fuzd',
	'snapshot',
	'debugTools',
	'missiv',
	'asPlayer',
];

function hostURI() {
	if (browser) {
		return `${location.protocol}//${location.hostname}`;
	} else {
		return `http://localhost`;
	}
}

function transformURI<STR extends string | undefined>(uri: STR): STR extends string ? string : undefined;
function transformURI(uri: string): string | undefined {
	const d = (() => {
		if (uri) {
			if (uri.startsWith('WEBHOST')) {
				const portAndPath = uri.split(':')[1];
				if (portAndPath) {
					return `${hostURI()}:${portAndPath}`;
				} else {
					const firstSlash = uri.indexOf('/');
					if (firstSlash >= 0) {
						return `${hostURI()}${uri.slice(firstSlash)}`;
					} else {
						return `${hostURI()}`;
					}
				}
			}
			const url = new URL(uri);
			if (url.hostname === 'WEBHOST') {
				url.hostname = location.hostname;
				return url.toString();
			}
		}
		return uri;
	})();
	console.log({uri: d});
	return d;
}

function noEndSlash(str: string) {
	if (str.endsWith('/')) {
		return str.slice(0, -1);
	}
	return str;
}

export const hashParams = getHashParamsFromLocation();
export const {params} = getParamsFromLocation();

const contractsChainId = initialContractsInfos.chainId as string;

let blockTime: number = 15;

let isUsingLocalDevNetwork = false;

// ------------------------------------------------------------------------------------------------
// DEFAULT RPC URL
// ------------------------------------------------------------------------------------------------
let defaultRPCURL: string | undefined = params['ethnode'];
if (contractsChainId === '1337' || contractsChainId === '31337') {
	isUsingLocalDevNetwork = true;
	if (!defaultRPCURL) {
		const url = PUBLIC_ETH_NODE_URI_LOCALHOST as string;
		if (url && url !== '') {
			defaultRPCURL = url;
		}
	}
	blockTime = PUBLIC_LOCALHOST_BLOCK_TIME ? parseInt(PUBLIC_LOCALHOST_BLOCK_TIME) : blockTime;
}
if (!defaultRPCURL) {
	const url = PUBLIC_ETH_NODE_URI as string;
	if (url && url !== '') {
		defaultRPCURL = url;
	}
}
defaultRPCURL = transformURI(defaultRPCURL);
// ------------------------------------------------------------------------------------------------

export const dev = 'dev' in params ? params['dev'] === 'true' : devEnvironment;

export const asPlayer = 'asPlayer' in params ? params['asPlayer'] : undefined;

export const debugTools = 'debugTools' in params ? params['debugTools'] === 'true' : false;

const snapshotURI = transformURI(params['snapshot'] || PUBLIC_SNAPSHOT_URI);
export const remoteIndexedState = snapshotURI ? `${noEndSlash(snapshotURI)}/${initialContractsInfos.name}/` : undefined;

const devURI = transformURI(PUBLIC_DEV_NODE_URI);

const localRPC = isUsingLocalDevNetwork && devURI ? {chainId: contractsChainId, url: devURI} : undefined;

const defaultRPC = defaultRPCURL ? {chainId: contractsChainId, url: defaultRPCURL} : undefined;

const syncURI = transformURI(params['sync'] || PUBLIC_SYNC_URI); //  'http://invalid.io'; // to emulate connection loss :)
const syncDBName = 'game-' + initialContractsInfos.chainId + '-' + initialContractsInfos.contracts.Game.address;

const fuzdURI = noEndSlash(
	params['fuzd'] ? (params['fuzd'] == 'false' ? '' : transformURI(params['fuzd'])) : transformURI(PUBLIC_FUZD_URI),
);

const missivURI = noEndSlash(
	params['missiv'] ? (params['missiv'] == 'false' ? '' : params['missiv']) : PUBLIC_MISSIV_URI,
);

const syncInfo = syncURI
	? {
			uri: syncURI,
		}
	: undefined;

const blockchainExplorer = (initialContractsInfos.chainInfo as any).blockExplorers?.default.url;

export {
	initialContractsInfos,
	contractsInfos,
	defaultRPC,
	isUsingLocalDevNetwork,
	localRPC,
	blockTime,
	syncDBName,
	syncInfo,
	fuzdURI,
	missivURI,
	blockchainExplorer,
};

export const localCache = new LocalCache(syncDBName);

console.log(`VERSION: ${version}`);
