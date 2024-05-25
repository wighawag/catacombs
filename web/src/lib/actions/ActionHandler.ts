import {gameView} from '$lib/state/ViewState';
import {account, accountData} from '$lib/blockchain/connection';

import {get} from 'svelte/store';
import {epochState} from '$lib/state/Epoch';
import {modalStack} from '$utils/ui/modals/ModalContainer.svelte';
import type {Camera} from '$lib/render/camera';
import {memory} from '$lib/state/memory';

export class ActionHandler {
	camera!: Camera;
	canvas!: HTMLCanvasElement;
	keydown!: (ev: KeyboardEvent) => void;
	keyup!: (ev: KeyboardEvent) => void;
	start(camera: Camera, canvas: HTMLCanvasElement) {
		this.camera = camera;
		this.canvas = canvas;
		this.camera.onClick = (x, y) => {
			this.onCellClicked(Math.floor(x), Math.floor(y));
		};
		this.keydown = this.onKeyDown.bind(this);
		this.keyup = this.onKeyUp.bind(this);
		document.addEventListener('keydown', this.keydown);
		document.addEventListener('keyup', this.keyup);
	}

	stop() {
		this.camera.onClick = undefined;
		document.removeEventListener('keydown', this.keydown);
		document.removeEventListener('keyup', this.keyup);
	}

	onKeyDown(ev: KeyboardEvent) {
		const $gameView = get(gameView);
		if (!$gameView.currentCharacter) {
			console.log('no current character');
			return;
		}
		const origPosition = $gameView.characters[$gameView.currentCharacter].position;
		const position = {x: origPosition.x, y: origPosition.y};
		if (ev.code === 'Space') {
			console.log('rewinding...');
			memory.rewind();
			return;
		}
		if (ev.code === 'ArrowUp') {
			position.y -= 1;
		} else if (ev.code === 'ArrowDown') {
			position.y += 1;
		} else if (ev.code === 'ArrowLeft') {
			position.x -= 1;
		} else if (ev.code === 'ArrowRight') {
			position.x += 1;
		}
		memory.addMove({position, action: '0x00'});
	}

	onKeyUp(ev: KeyboardEvent) {}

	onCellClicked(x: number, y: number) {
		if (modalStack.present > 0) {
			return;
		}

		const player = account.$state.address;
		if (!player) {
			console.log('no account');
			return; // TODO
		}
	}
}
