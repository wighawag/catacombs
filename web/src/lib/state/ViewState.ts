import type {Data, Character} from 'template-game-indexer';
import {derived} from 'svelte/store';
import {contractState, connection} from '$lib/state';
// import {epochState, type EpochState} from '$lib/state/Epoch';
// import type {OnChainActions} from '$lib/account/base';
// import type {GameMetadata, LocalMove, OffchainState} from '$lib/account/account-data';
import {memory, type MemoryState} from './memory';
import type {Monster} from 'template-game-common';
import {initialState, type InitialState} from './initialState';
import type {Connection} from '$lib/blockchain/connection';

// TODO
export type GameViewState = {
	hasCommitment?: boolean; // TODO
	currentCharacter?: string;
	characters: {[id: string]: Character};
	monsters: readonly Monster[];
	inBattle?: {
		monster: Monster;
	};
	memory: MemoryState;
};
// function isValidMove(move: LocalMove) {
// 	// TODO
// 	return false;
// }

function merge(
	state: Data,
	initialState: InitialState,
	memory: MemoryState,
	connection: Connection,
	// offchainState: OffchainState,
	// onchainActions: OnChainActions<GameMetadata>,
	// epochState: EpochState,
	// account: AccountState<`0x${string}`>,
): GameViewState {
	const viewState: GameViewState = {
		characters: {},
		monsters: [],
		memory,
	};
	for (const key of Object.keys(state.characters)) {
		const onchain = state.characters[key];
		if (connection.address && onchain.controllers[connection.address]) {
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

		if (memory.stateChanges.length > 0) {
			viewState.monsters = memory.stateChanges[memory.stateChanges.length].monsters;
		} else if (initialState.stateChanges) {
			viewState.monsters = initialState.stateChanges.monsters;
		}
	}

	return viewState;
}

// export const gameView = derived(
// 	[state, initialState, memory, accountData.offchainState, accountData.onchainActions, epochState, account],
// 	([$state, $initialState, $memory, $offchainState, $onchainActions, $epochState, $account]) => {
// 		return merge($state, $initialState, $memory, $offchainState, $onchainActions, $epochState, $account);
// 	},
// );
export const gameView = derived(
	[contractState.state, initialState, memory, connection],
	([$state, $initialState, $memory, $connection]) => {
		return merge($state, $initialState, $memory, $connection);
	},
);

export type GameView = Omit<typeof gameView, '$state'>;

if (typeof window !== 'undefined') {
	(window as any).gameView = gameView;
}
