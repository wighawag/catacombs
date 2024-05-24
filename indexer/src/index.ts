import type {MergedAbis, JSProcessor, EventWithArgs} from 'ethereum-indexer-js-processor';
import {fromJSProcessor} from 'ethereum-indexer-js-processor';
import contractsInfo from './contracts';


export type Data = {
	
};

type ContractsABI = MergedAbis<typeof contractsInfo.contracts>;

const GameIndexerProcessor: JSProcessor<ContractsABI, Data> = {
	// version is automatically populated via version.cjs to let the browser knows to reindex on changes
	// only works if the changes ends up in the generated js
	version: '__VERSION_HASH__', //
	construct(): Data {
		return {
			cells: {},
			owners: {},
			commitments: {},
			placements: [],
			points: {
				global: {lastUpdateTime: 0, totalRewardPerPointAtLastUpdate: 0n, totalPoints: 0n},
				fixed: {},
				shared: {},
			},
			computedPoints: {},
		};
	},
	
};

export const createProcessor = fromJSProcessor(() => GameIndexerProcessor);
