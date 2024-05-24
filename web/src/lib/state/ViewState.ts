
import type {Data} from 'template-game-indexer';
import {derived} from 'svelte/store';
import {state} from '$lib/state/State';
import {account, accountData} from '$lib/blockchain/connection';
import {epochState, type EpochState} from '$lib/state/Epoch';
import type {AccountState} from 'web3-connection';
import type {OnChainActions} from '$lib/account/base';
import type { GameMetadata, LocalMove, OffchainState } from '$lib/account/account-data';


// TODO
export type GameViewState = Data & {
	hasCommitment?: boolean // TODO
};
function isValidMove(move: LocalMove) {
	// TODO
	return false;
}


function merge(
	state: Data,
	offchainState: OffchainState,
	onchainActions: OnChainActions<GameMetadata>,
	epochState: EpochState,
	account: AccountState<`0x${string}`>,
): GameViewState {
	const viewState = state;
	return viewState;
}

export const gameView = derived(
	[state, accountData.offchainState, accountData.onchainActions, epochState, account],
	([$state, $offchainState, $onchainActions, $epochState, $account]) => {
		return merge($state, $offchainState, $onchainActions, $epochState, $account);
	},
);

export type GameView = Omit<typeof gameView, '$state'>;

if (typeof window !== 'undefined') {
	(window as any).gameView = gameView;
}
