import {writable} from 'svelte/store';
import {bigIntIDToXY, xyToBigIntID, type Context, type StateChanges} from 'template-game-common';
import {evmGame} from './computed';
import {zeroAddress, zeroHash} from 'viem';
import {AccountState, type OffchainState} from './AccountState';
import type {ConnectedState, ConnectedStateStore} from './ConnectedState';

export type InitialState =
	| {stateChanges: undefined; context: undefined}
	| {
			stateChanges: StateChanges;
			context: Context;
	  };

// TODO derive from Indexed State => undefined | 'computing' | InitialState
// Context can also be computed from IndexedState but this can be instant (no computing needed)
// It cannot be computed from Indexed State directly as it depends on connected account

// NOTE: to manage multiple character, the initialState would be an array, same as context

export function initInitialStateChanges(connectedState: ConnectedStateStore, accountState: AccountState) {
	const $store: InitialState = {stateChanges: undefined, context: undefined};
	const store = writable<InitialState>($store);

	const initialState = {
		$store,
		subscribe: store.subscribe,
	};

	let lastConnectedState: ConnectedState | undefined;
	let lastOffchainState: OffchainState | undefined;

	// TODO promise track and throttle
	async function update($connectedState?: ConnectedState, $offchainState?: OffchainState) {
		if ($connectedState && $offchainState) {
			let context: Context;
			// TODO
			const currentCharacter = $connectedState.myCharacters[0];
			if (currentCharacter) {
				// TODO fetch context or give it: Context will be taken from indexer
				context = {
					// TODO context
					characterID: BigInt(currentCharacter.id || '1'),
					actions: [],
					controller: zeroAddress, // TODO
					epoch: 0,
					priorPosition: xyToBigIntID(currentCharacter.position.x, currentCharacter.position.y),
					secret: zeroHash,

					priorGold: 0n, // TODO
					priorXP: currentCharacter.xp,
					priorHP: currentCharacter.hp,
					accessory1: 0n, // TODO
					accessory2: 0n, //
					// TODO : (2 << 98) | (2 << 91) | (2 << 84) | (1 << 77) | (2 << 70)
					attackGear: 643767809466671935455840174080n, //  (2 << 98) | (4 << 91) | (2 << 84) | (2 << 77) | (1 << 70); // <uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>
					// TODO : (2 << 98) | (2 << 91) | (0 << 84) | (0 << 77) | (1 << 70)
					defenseGear: 641311122266079177861601689600n, // (2 << 98) | (3 << 91) | (3 << 84) | (1 << 77) | (2 << 70); // <uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>,
				};
			} else {
				context = {
					// TODO context
					characterID: 1n,
					actions: [],
					controller: zeroAddress,
					epoch: 0,
					priorPosition: xyToBigIntID(0, 19),
					secret: zeroHash,

					priorGold: 0n,
					priorXP: 0,
					priorHP: 0,
					accessory1: 0n,
					accessory2: 0n,
					// TODO : (2 << 98) | (2 << 91) | (2 << 84) | (1 << 77) | (2 << 70)
					attackGear: 643767809466671935455840174080n, //  (2 << 98) | (4 << 91) | (2 << 84) | (2 << 77) | (1 << 70); // <uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>
					// TODO : (2 << 98) | (2 << 91) | (0 << 84) | (0 << 77) | (1 << 70)
					defenseGear: 641311122266079177861601689600n, // (2 << 98) | (3 << 91) | (3 << 84) | (1 << 77) | (2 << 70); // <uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>,
				};
			}

			const initialStateChanges = await evmGame.initialStateChanges(context);

			$store.stateChanges = initialStateChanges;
			$store.context = context;
			store.set($store);
		}
	}

	connectedState.subscribe(($connectedState) => {
		lastConnectedState = $connectedState;
		update(lastConnectedState, lastOffchainState);
	});

	accountState.offchainState.subscribe(($offchainState) => {
		lastOffchainState = $offchainState;
		update(lastConnectedState, lastOffchainState);
	});

	return initialState;
}
