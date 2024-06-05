import type {Data, Character} from 'template-game-indexer';
import {derived} from 'svelte/store';
import {state} from '$lib/state/State';
import {account, accountData} from '$lib/blockchain/connection';
import {epochState, type EpochState} from '$lib/state/Epoch';
import type {AccountState} from 'web3-connection';
import type {OnChainActions} from '$lib/account/base';
import type {GameMetadata, LocalMove, OffchainState} from '$lib/account/account-data';
import {memory, type MemoryState} from './memory';
import type {Monster} from 'template-game-common';

// TODO
export type GameViewState = {
	hasCommitment?: boolean; // TODO
	currentCharacter?: string;
	characters: {[id: string]: Character};
	monsters: Monster[];
};
function isValidMove(move: LocalMove) {
	// TODO
	return false;
}

function merge(
	state: Data,
	memory: MemoryState,
	offchainState: OffchainState,
	onchainActions: OnChainActions<GameMetadata>,
	epochState: EpochState,
	account: AccountState<`0x${string}`>,
): GameViewState {
	const viewState: GameViewState = {
		characters: {},
		monsters: [],
	};
	for (const key of Object.keys(state.characters)) {
		const onchain = state.characters[key];
		if (account.address && onchain.controllers[account.address]) {
			viewState.currentCharacter = key;
		}
		viewState.characters[key] = {
			controllers: onchain.controllers,
			id: onchain.id,
			position: {
				x: onchain.position.x,
				y: onchain.position.y,
			},
		};
	}
	if (viewState.currentCharacter) {
		const currentCharacter = viewState.characters[viewState.currentCharacter];
		let currentPosition = currentCharacter.position;
		for (const move of memory.moves) {
			currentPosition = move.position;
		}
		currentCharacter.position = currentPosition;

		if (memory.stateChanges) {
			viewState.monsters = memory.stateChanges.monsters;
		}
	}

	return viewState;
}

export const gameView = derived(
	[state, memory, accountData.offchainState, accountData.onchainActions, epochState, account],
	([$state, $memory, $offchainState, $onchainActions, $epochState, $account]) => {
		return merge($state, $memory, $offchainState, $onchainActions, $epochState, $account);
	},
);

export type GameView = Omit<typeof gameView, '$state'>;

if (typeof window !== 'undefined') {
	(window as any).gameView = gameView;
}
