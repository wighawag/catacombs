import type {Character} from 'template-game-indexer';
import {derived} from 'svelte/store';
// import {epochState, type EpochState} from '$lib/state/Epoch';
// import type {OnChainActions} from '$lib/account/base';
// import type {GameMetadata, LocalMove, OffchainState} from '$lib/account/account-data';
import {bigIntIDToXY, type Context, type Monster, type StateChanges} from 'template-game-common';
import {connectedState, type ConnectedState} from './ConnectedState';
import {accountState, type GameTxMetadata, type OffchainState} from './AccountState';
import type {InitialState} from './InitialStateChanges';
import {initialStateChanges} from '.';
import type {OnChainActions} from '$lib/account/base';

export type MovingMonster = Monster & {
	old: {
		x: number;
		y: number;
	};
};

export type GameValidStage = 'intro' | 'game';
export type GameStage = GameValidStage | 'pending';

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
	offchainState?: OffchainState;
	currentStateChanges?: StateChanges;
	context?: Context;
	stage: GameStage;
};
// function isValidMove(move: LocalMove) {
// 	// TODO
// 	return false;
// }

const $state: GameViewState = {
	otherCharacters: [],
	myCharacters: [],
	monsters: [],
	stage: 'game',
};
function merge(
	connectedState: ConnectedState,
	initialState: InitialState,
	offchainState: OffchainState,
	onchainActions: OnChainActions<GameTxMetadata>,
	// epochState: EpochState,
	// account: AccountState<`0x${string}`>,
): GameViewState {
	$state.monsters = [];
	$state.offchainState = offchainState;
	$state.inBattle = undefined;
	$state.context = initialState.context;
	$state.hasCommitment = connectedState.hasCommitment;
	$state.myCharacters = [...connectedState.myCharacters];
	$state.otherCharacters = connectedState.otherCharacters;

	for (const txHash of Object.keys(onchainActions)) {
		const onchainAction = onchainActions[txHash as `0x${string}`];
		if (onchainAction.tx.metadata?.type === 'enter') {
			$state.stage = 'pending';
		}
	}

	$state.stage = 'game';
	if ($state.myCharacters.length == 0) {
		if (initialState.stateChanges) {
			$state.myCharacters.push({
				controllers: {},
				hp: 50,
				id: '1',
				position: {x: 0, y: 19},
				xp: 0,
				attackGear: initialState.context.attackGear,
				defenseGear: initialState.context.defenseGear,
			});
		}
		$state.stage = 'intro';
	}

	$state.currentStateChanges = initialState.stateChanges;

	// TODO based on offchainState; for now only first character
	const currentCharacter = $state.myCharacters[0] ? {...$state.myCharacters[0]} : undefined;
	$state.currentCharacter = currentCharacter;

	// if we the offchain statechanges apply to the current onchain stage (intro vs in-game)
	if (offchainState.stage === $state.stage) {
		if (offchainState.stateChanges.length > 0) {
			$state.currentStateChanges = offchainState.stateChanges[offchainState.stateChanges.length - 1];
		}

		if (currentCharacter) {
			let currentPosition = currentCharacter.position;
			for (const move of offchainState.moves) {
				if (move.type === 'move') {
					currentPosition = move.position;
				}
			}
			currentCharacter.position = currentPosition;
			if ($state.currentStateChanges) {
				currentCharacter.hp = $state.currentStateChanges.newHP;
				currentCharacter.xp = $state.currentStateChanges.newXP;
			}

			if (offchainState.stateChanges.length > 0) {
				if (offchainState.stateChanges.length > 1) {
					$state.monsters = offchainState.stateChanges[offchainState.stateChanges.length - 1].monsters.map((v, i) => ({
						...v,
						old: {
							x: offchainState.stateChanges[offchainState.stateChanges.length - 2].monsters[i].x,
							y: offchainState.stateChanges[offchainState.stateChanges.length - 2].monsters[i].y,
						},
					}));
				} else {
					$state.monsters = offchainState.stateChanges[offchainState.stateChanges.length - 1].monsters.map((v, i) => ({
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

			// TODO use stateChanges.battle.
			for (const monster of $state.monsters) {
				if (monster.hp > 0 && monster.x == currentCharacter.position.x && monster.y == currentCharacter.position.y) {
					$state.inBattle = {
						monster,
					};
				}
			}
		}
	} else if ($state.currentStateChanges) {
		$state.monsters = $state.currentStateChanges.monsters.map((v) => ({
			...v,
			old: {
				x: v.x,
				y: v.y,
			},
		}));
	}

	return $state;
}

// export const gameView = derived(
// 	[state, initialState, offchainState, accountData.offchainState, accountData.onchainActions, epochState, account],
// 	([$state, $initialState, $offchainState, $offchainState, $onchainActions, $epochState, $account]) => {
// 		return merge($state, $initialState, $offchainState, $offchainState, $onchainActions, $epochState, $account);
// 	},
// );
export const gameView = {
	...derived(
		[connectedState, initialStateChanges, accountState.offchainState, accountState.onchainActions],
		([$connectedState, $initialState, $offchainState, $onchainActions]) => {
			return merge($connectedState, $initialState, $offchainState, $onchainActions);
		},
	),
	$state,
};

export type GameView = typeof gameView;

if (typeof window !== 'undefined') {
	(window as any).gameView = gameView;
}
