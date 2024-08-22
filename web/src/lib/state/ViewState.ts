import type {Character} from 'template-game-indexer';
import {derived} from 'svelte/store';
// import {epochState, type EpochState} from '$lib/state/Epoch';
// import type {OnChainActions} from '$lib/account/base';
// import type {GameMetadata, LocalMove, OffchainState} from '$lib/account/account-data';
import {memory, type MemoryState} from './memory';
import type {Context, Monster, StateChanges} from 'template-game-common';
import {initialState, type InitialState} from './initialState';
import {connectedState, type ConnectedState} from './ConnectedState';

export type MovingMonster = Monster & {
	old: {
		x: number;
		y: number;
	};
};

// TODO
export type GameViewState = {
	otherCharacters: Character[];
	myCharacters: Character[];
	hasCommitment?: boolean; // TODO
	currentCharacter?: Character;
	monsters: readonly MovingMonster[];
	inBattle?: {
		monster: Monster;
	};
	memory: MemoryState;
	currentStateChanges?: StateChanges;
	context?: Context;
	type: 'intro' | 'game';
};
// function isValidMove(move: LocalMove) {
// 	// TODO
// 	return false;
// }

const $state: GameViewState = {
	otherCharacters: [],
	myCharacters: [],
	monsters: [],
	memory: {moves: [], stateChanges: [], tutorialStep: 0, stateChangesTimestamp: 0},
	type: 'game',
};
function merge(
	connectedState: ConnectedState,
	initialState: InitialState,
	memory: MemoryState,
	// offchainState: OffchainState,
	// onchainActions: OnChainActions<GameMetadata>,
	// epochState: EpochState,
	// account: AccountState<`0x${string}`>,
): GameViewState {
	$state.monsters = [];
	$state.memory = memory;
	$state.inBattle = undefined;
	$state.context = initialState.context;
	$state.hasCommitment = connectedState.hasCommitment;
	$state.myCharacters = connectedState.myCharacters;
	$state.otherCharacters = connectedState.otherCharacters;
	$state.currentStateChanges =
		memory.stateChanges.length > 0 ? memory.stateChanges[memory.stateChanges.length - 1] : initialState.stateChanges;

	const currentCharacter = $state.myCharacters[0]; // TODO based on offchainState;
	$state.currentCharacter = currentCharacter;
	if (currentCharacter) {
		let currentPosition = currentCharacter.position;
		for (const move of memory.moves) {
			if (move.type === 'move') {
				currentPosition = move.position;
			}
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

	if (currentCharacter) {
		let currentPosition = currentCharacter.position;
		for (const move of memory.moves) {
			if (move.type == 'move') {
				currentPosition = move.position;
			}
		}
		currentCharacter.position = currentPosition;

		for (const monster of $state.monsters) {
			if (monster.hp > 0 && monster.x == currentCharacter.position.x && monster.y == currentCharacter.position.y) {
				$state.inBattle = {
					monster,
				};
			}
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
	...derived([connectedState, initialState, memory], ([$connectedState, $initialState, $memory]) => {
		return merge($connectedState, $initialState, $memory);
	}),
	$state,
};

export type GameView = typeof gameView;

if (typeof window !== 'undefined') {
	(window as any).gameView = gameView;
}
