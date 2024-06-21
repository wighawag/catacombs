import {type GameView} from '$lib/state/ViewState';

import {get} from 'svelte/store';
import {modalStack} from '$utils/ui/modals/ModalContainer.svelte';
import {camera, type Camera} from '$lib/render/camera';
import {memory} from '$lib/state/memory';
import {bigIntIDToXY, xyToBigIntID, type Monster, type MonsterList} from 'template-game-common';
import {evmGame} from '$lib/state/computed';
import {initialiseStateChanges} from '$lib/state/initialState';
import {connection} from '$lib/state';

export class ActionHandler {
	camera!: Camera;
	canvas!: HTMLCanvasElement;
	gameView!: GameView;

	keydown!: (ev: KeyboardEvent) => void;
	keyup!: (ev: KeyboardEvent) => void;

	start(camera: Camera, canvas: HTMLCanvasElement, gameView: GameView) {
		this.camera = camera;
		this.canvas = canvas;
		this.gameView = gameView;
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
		const $gameView = get(this.gameView);
		if (!$gameView.currentCharacter) {
			console.log('no current character');
			return;
		}
		const currentStateChanges = memory.$store.stateChanges[memory.$store.stateChanges.length - 1] || undefined;
		const origPosition = currentStateChanges?.newPosition
			? bigIntIDToXY(currentStateChanges.newPosition)
			: $gameView.characters[$gameView.currentCharacter].position;
		const position = {x: origPosition.x, y: origPosition.y};
		if (ev.code === 'Space') {
			console.log('reseting...');
			memory.reset();

			// TODO DRY
			const currentStateChanges = memory.$store.stateChanges[memory.$store.stateChanges.length - 1] || undefined;
			const origPosition = currentStateChanges?.newPosition
				? bigIntIDToXY(currentStateChanges.newPosition)
				: $gameView.characters[$gameView.currentCharacter].position;
			const position = {x: origPosition.x, y: origPosition.y};
			console.log({position});
			camera.navigate(position.x, position.y, camera.$store.zoom);
			return;
		}
		if (ev.code === 'Backspace') {
			console.log('rewinding...');
			memory.rewind();

			// TODO DRY
			const currentStateChanges = memory.$store.stateChanges[memory.$store.stateChanges.length - 1] || undefined;
			const origPosition = currentStateChanges?.newPosition
				? bigIntIDToXY(currentStateChanges.newPosition)
				: $gameView.characters[$gameView.currentCharacter].position;
			const position = {x: origPosition.x, y: origPosition.y};
			console.log({position});
			camera.navigate(position.x, position.y, camera.$store.zoom);
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
		if (currentStateChanges?.monsters) {
			monsters = currentStateChanges?.monsters;
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

		const player = connection.$state.address;
		if (!player) {
			console.log('no account');
			return; // TODO
		}
	}
}
