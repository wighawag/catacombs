import {type Data, ControllerType, type Character} from 'template-game-indexer';
import {derived, writable} from 'svelte/store';
import {contractState, connection} from '$lib/state';
import {memory, type MemoryState} from './memory';
import {type InitialState} from './initialState';
import type {Connection} from '$lib/blockchain/connection';
import type {GameViewState} from './ViewState';
import {bigIntIDToXY, xyToBigIntID} from 'template-game-common';
import {zeroAddress, zeroHash} from 'viem';

const initialState = writable<InitialState>({
	// FAKE DATA FOR INTRODUCTION:
	// TODO derive stateChanges from fake context
	stateChanges: {
		characterID: 1n,
		newPosition: xyToBigIntID(0, 19),
		newXP: 0,
		epoch: 0,
		newHP: 50,
		monsters: [
			{x: 0, y: 5, hp: 1, kind: 1},
			{x: 0, y: 10, hp: 1, kind: 1},
			{x: 0, y: 15, hp: 1, kind: 1},
			{x: 0, y: 20, hp: 1, kind: 1},
			{x: 0, y: 25, hp: 1, kind: 1},
		],
		battle: {
			monsterIndexPlus1: 0,
			attackCardsUsed1: 0,
			defenseCardsUsed1: 0,
			attackCardsUsed2: 0,
			defenseCardsUsed2: 0,
		},
	},
	context: {
		// TODO context
		characterID: 1n,
		actions: [],
		controller: zeroAddress,
		epoch: 0,
		priorPosition: 0n,
		secret: zeroHash,

		priorGold: 0n,
		priorXP: 0,
		priorHP: 50,
		accessory1: 0n,
		accessory2: 0n,
		// TODO : (2 << 98) | (2 << 91) | (2 << 84) | (1 << 77) | (2 << 70)
		attackGear: 643767809466671935455840174080n, //  (2 << 98) | (4 << 91) | (2 << 84) | (2 << 77) | (1 << 70); // <uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>
		// TODO : (2 << 98) | (2 << 91) | (0 << 84) | (0 << 77) | (1 << 70)
		defenseGear: 641311122266079177861601689600n, // (2 << 98) | (3 << 91) | (3 << 84) | (1 << 77) | (2 << 70); // <uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>
	},
});

const $state: GameViewState = {
	myCharacters: [],
	otherCharacters: [],
	monsters: [],
	memory: {moves: [], stateChanges: [], tutorialStep: 0, stateChangesTimestamp: 0},
	type: 'intro',
};
function merge(
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
			xp: initialState.stateChanges.newXP,
			hp: initialState.stateChanges.newHP,
			position: bigIntIDToXY(initialState.stateChanges.newPosition),
		};
	}

	console.log({stateChanges: memory.stateChanges});

	$state.myCharacters = currentCharacter ? [currentCharacter] : [];
	$state.currentCharacter = currentCharacter;

	$state.monsters = [];
	$state.memory = memory;
	$state.inBattle = undefined;
	$state.context = initialState.context;
	$state.currentStateChanges =
		memory.stateChanges.length > 0 ? memory.stateChanges[memory.stateChanges.length - 1] : initialState.stateChanges;

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

		if (currentCharacter) {
			currentCharacter.xp = memory.stateChanges[memory.stateChanges.length - 1].newXP;
			currentCharacter.hp = memory.stateChanges[memory.stateChanges.length - 1].newHP;
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

	console.log($state.monsters, currentCharacter);

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
	...derived([initialState, memory, connection], ([$initialState, $memory, $connection]) => {
		return merge($initialState, $memory, $connection);
	}),
	$state,
};

if (typeof window !== 'undefined') {
	(window as any).introductionGameView = gameView;
}
