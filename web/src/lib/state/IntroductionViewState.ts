import {type Data, ControllerType} from 'template-game-indexer';
import {derived} from 'svelte/store';
import {contractState, connection} from '$lib/state';
import {memory, type MemoryState} from './memory';
import {initialState, type InitialState} from './initialState';
import type {Connection} from '$lib/blockchain/connection';
import type {GameViewState} from './ViewState';

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
		characters: connection.address
			? {
					'1': {
						id: '1',
						position: {
							x: 0,
							y: 0,
						},
						controllers: {
							[connection.address]: ControllerType.Owner,
						},
					},
				}
			: {},
		monsters: [],
		memory,
	};
	viewState.currentCharacter = connection.address ? '1' : undefined;

	if (memory.stateChanges.length > 0) {
		viewState.monsters = memory.stateChanges[memory.stateChanges.length - 1].monsters;
	} else if (initialState.stateChanges) {
		viewState.monsters = initialState.stateChanges.monsters;
	}

	if (viewState.currentCharacter) {
		const currentCharacter = viewState.characters[viewState.currentCharacter];
		let currentPosition = currentCharacter.position;
		for (const move of memory.moves) {
			currentPosition = move.position;
		}
		currentCharacter.position = currentPosition;

		for (const monster of viewState.monsters) {
			if (monster.x == currentCharacter.position.x && monster.y == currentCharacter.position.y) {
				viewState.inBattle = {
					monster,
				};
			}
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

if (typeof window !== 'undefined') {
	(window as any).introductionGameView = gameView;
}
