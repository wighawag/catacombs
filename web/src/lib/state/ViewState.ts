import type {Data, Character} from 'template-game-indexer';
import {derived} from 'svelte/store';
import {contractState, connection} from '$lib/state';
// import {epochState, type EpochState} from '$lib/state/Epoch';
// import type {OnChainActions} from '$lib/account/base';
// import type {GameMetadata, LocalMove, OffchainState} from '$lib/account/account-data';
import {memory, type MemoryState} from './memory';
import type {Monster, StateChanges} from 'template-game-common';
import {initialState, type InitialState} from './initialState';
import type {Connection} from '$lib/blockchain/connection';

export type MovingMonster = Monster & {
	old: {
		x: number;
		y: number;
	};
};

// TODO
export type GameViewState = {
	hasCommitment?: boolean; // TODO
	currentCharacter?: string;
	characters: {[id: string]: Character};
	monsters: readonly MovingMonster[];
	inBattle?: {
		monster: Monster;
	};
	memory: MemoryState;
	currentStateChanges?: StateChanges;
	type: 'intro' | 'game';
};
// function isValidMove(move: LocalMove) {
// 	// TODO
// 	return false;
// }

const $state: GameViewState = {
	characters: {},
	monsters: [],
	memory: {moves: [], stateChanges: [], step: 0, tutorialStep: 0, stateChangesTimestamp: 0},
	type: 'game',
};
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
	$state.characters = {};
	$state.monsters = [];
	$state.memory = memory;
	$state.inBattle = undefined;
	$state.currentStateChanges =
		memory.stateChanges.length > 0 ? memory.stateChanges[memory.stateChanges.length - 1] : initialState.stateChanges;
	for (const key of Object.keys(state.characters)) {
		const onchain = state.characters[key];
		if (connection.address && onchain.controllers[connection.address]) {
			$state.currentCharacter = key;
		}
		$state.characters[key] = {
			controllers: onchain.controllers,
			id: onchain.id,
			position: {
				x: onchain.position.x,
				y: onchain.position.y,
			},
		};
	}
	if ($state.currentCharacter) {
		const currentCharacter = $state.characters[$state.currentCharacter];
		let currentPosition = currentCharacter.position;
		for (const move of memory.moves) {
			currentPosition = move.position;
		}
		currentCharacter.position = currentPosition;

		if (memory.stateChanges.length > 0) {
			if (memory.stateChanges.length > 1) {
				$state.monsters = memory.stateChanges[memory.stateChanges.length - 1].monsters.map((v, i) => ({
					...v,
					old: {
						x: memory.stateChanges[memory.stateChanges.length - 2].monsters[i].x,
						y: memory.stateChanges[memory.stateChanges.length - 2].monsters[i].y,
					},
				}));
			} else {
				$state.monsters = memory.stateChanges[memory.stateChanges.length - 1].monsters.map((v, i) => ({
					...v,
					old: {
						x: initialState.stateChanges?.monsters[i].x || v.x,
						y: initialState.stateChanges?.monsters[i].y || v.y,
					},
				}));
			}
		} else if (initialState.stateChanges) {
			$state.monsters = initialState.stateChanges.monsters.map((v) => ({
				...v,
				old: {
					x: v.x,
					y: v.y,
				},
			}));
		}
	}

	return $state;
}

// export const gameView = derived(
// 	[state, initialState, memory, accountData.offchainState, accountData.onchainActions, epochState, account],
// 	([$state, $initialState, $memory, $offchainState, $onchainActions, $epochState, $account]) => {
// 		return merge($state, $initialState, $memory, $offchainState, $onchainActions, $epochState, $account);
// 	},
// );
export const gameView = {
	...derived(
		[contractState.state, initialState, memory, connection],
		([$state, $initialState, $memory, $connection]) => {
			return merge($state, $initialState, $memory, $connection);
		},
	),
	$state,
};

export type GameView = typeof gameView;

if (typeof window !== 'undefined') {
	(window as any).gameView = gameView;
}
