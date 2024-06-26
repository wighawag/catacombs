import {gameView} from '$lib/state/ViewState';
import {account, accountData} from '$lib/blockchain/connection';

import {get} from 'svelte/store';
import {epochState} from '$lib/state/Epoch';
import {modalStack} from '$utils/ui/modals/ModalContainer.svelte';
import {camera, type Camera} from '$lib/render/camera';
import {memory} from '$lib/state/memory';
import {zeroAddress, zeroHash} from 'viem';
import {bigIntIDToXY, xyToBigIntID, type Monster, type MonsterList} from 'template-game-common';
import {evmGame} from '$lib/state/computed';
import {initialiseStateChanges} from '$lib/state/initialState';

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

	async onKeyDown(ev: KeyboardEvent) {
		const $gameView = get(gameView);
		if (!$gameView.currentCharacter) {
			console.log('no current character');
			return;
		}
		const origPosition = memory.$store.stateChanges?.newPosition
			? bigIntIDToXY(memory.$store.stateChanges.newPosition)
			: $gameView.characters[$gameView.currentCharacter].position;
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

		const {x, y} = origPosition;
		let monsters: MonsterList;
		if (memory.$store.stateChanges?.monsters) {
			monsters = memory.$store.stateChanges?.monsters;
		} else {
			const initialStateChanges = await initialiseStateChanges();
			monsters = initialStateChanges.monsters;
		}

		const stateChanges = await evmGame.stepChanges(
			{
				characterID: 1n,
				epoch: 0,
				monsters,
				newPosition: xyToBigIntID(origPosition.x, origPosition.y),
			},
			{
				position: xyToBigIntID(position.x, position.y),
				action: 0n,
			},
		);
		console.log(stateChanges);
		const pos = bigIntIDToXY(stateChanges.newPosition);
		memory.addMove({position: pos, action: '0x00'}, stateChanges);

		camera.navigate(pos.x, pos.y, camera.$store.zoom);
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
