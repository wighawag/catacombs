import {gameView} from '$lib/state/ViewState';
import {account, accountData} from '$lib/blockchain/connection';

import {get} from 'svelte/store';
import {epochState} from '$lib/state/Epoch';
import {modalStack} from '$utils/ui/modals/ModalContainer.svelte';

export class ActionHandler {
	onCellClicked(x: number, y: number) {
		if (modalStack.present > 0) {
			return;
		}

		const player = account.$state.address;
		if (!player) {
			console.log('no account');
			return; // TODO
		}

		const currentState = get(gameView);
		const currentOffchainState = get(accountData.offchainState);
		const $epochState = get(epochState);
		// TODO
	}
}
