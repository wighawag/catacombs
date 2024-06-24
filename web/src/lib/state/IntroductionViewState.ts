import {type Data, ControllerType, type Character} from 'template-game-indexer';
import {derived, writable} from 'svelte/store';
import {contractState, connection} from '$lib/state';
import {memory, type MemoryState} from './memory';
import {type InitialState} from './initialState';
import type {Connection} from '$lib/blockchain/connection';
import type {GameViewState} from './ViewState';
import {bigIntIDToXY, xyToBigIntID} from 'template-game-common';

const initialState = writable<InitialState>({
	stateChanges: {
		characterID: 1n,
		newPosition: xyToBigIntID(0, 19),
		xp: 0,
		epoch: 0,
		hp: 50,
		monsters: [
			{x: 0, y: 5, hp: 1, kind: 1},
			{x: 0, y: 10, hp: 1, kind: 1},
			{x: 0, y: 15, hp: 1, kind: 1},
			{x: 0, y: 20, hp: 1, kind: 1},
			{x: 0, y: 25, hp: 1, kind: 1},
		],
		battle: {
			monsterIndexPlus1: 0,
			cardsUsed1: 0,
			cardsUsed2: 0,
		},
	},
});

const $state: GameViewState = {
	characters: {},
	monsters: [],
	memory: {moves: [], stateChanges: [], step: 0},
	type: 'intro',
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
	let currentCharacter: Character | undefined;
	if (initialState.stateChanges && connection.address) {
		currentCharacter = {
			controllers: {[connection.address]: ControllerType.Owner},
			id: initialState.stateChanges.characterID.toString(),
			position: bigIntIDToXY(initialState.stateChanges.newPosition),
		};
	}
	$state.characters = currentCharacter ? {[currentCharacter.id]: currentCharacter} : {};
	$state.monsters = [];
	$state.memory = memory;
	$state.inBattle = undefined;
	$state.currentStateChanges =
		memory.stateChanges.length > 0 ? memory.stateChanges[memory.stateChanges.length - 1] : initialState.stateChanges;

	$state.currentCharacter = currentCharacter?.id;

	if (memory.stateChanges.length > 0) {
		$state.monsters = memory.stateChanges[memory.stateChanges.length - 1].monsters;
	} else if (initialState.stateChanges) {
		$state.monsters = initialState.stateChanges.monsters;
	}

	console.log($state.monsters, currentCharacter);

	if (currentCharacter) {
		let currentPosition = currentCharacter.position;
		for (const move of memory.moves) {
			currentPosition = move.position;
		}
		currentCharacter.position = currentPosition;

		for (const monster of $state.monsters) {
			if (monster.x == currentCharacter.position.x && monster.y == currentCharacter.position.y) {
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
	...derived(
		[contractState.state, initialState, memory, connection],
		([$state, $initialState, $memory, $connection]) => {
			return merge($state, $initialState, $memory, $connection);
		},
	),
	$state,
};

if (typeof window !== 'undefined') {
	(window as any).introductionGameView = gameView;
}
