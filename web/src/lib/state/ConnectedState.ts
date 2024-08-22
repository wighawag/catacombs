import type {Data, Character} from 'template-game-indexer';
import {derived} from 'svelte/store';
import {contractState, connection} from '$lib/state';
import type {Context} from 'template-game-common';
import type {Connection} from '$lib/blockchain/connection';

// TODO
export type ConnectedState = {
	hasCommitment?: boolean; // TODO
	otherCharacters: Character[];
	myCharacters: Character[];
};

const $state: ConnectedState = {
	otherCharacters: [],
	myCharacters: [],
};
function merge(state: Data, connection: Connection): ConnectedState {
	$state.otherCharacters.splice(0, $state.otherCharacters.length);
	$state.myCharacters.splice(0, $state.myCharacters.length);

	for (const key of Object.keys(state.characters)) {
		const onchain = state.characters[key];
		if (connection.address && onchain.controllers[connection.address.toLowerCase() as `0x${string}`]) {
			$state.myCharacters.push({...onchain});
		} else {
			$state.otherCharacters.push({...onchain});
		}
	}

	return $state;
}

export const connectedState = {
	...derived([contractState.state, connection], ([$state, $connection]) => {
		return merge($state, $connection);
	}),
	$state,
};

export type ConnectedStateStore = typeof connectedState;

if (typeof window !== 'undefined') {
	(window as any).connectedState = connectedState;
}
