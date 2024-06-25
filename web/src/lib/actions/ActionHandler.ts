import {type GameView} from '$lib/state/ViewState';

import {get} from 'svelte/store';
import {modalStack} from '$utils/ui/modals/ModalContainer.svelte';
import {camera, type Camera} from '$lib/render/camera';
import {memory} from '$lib/state/memory';
import {bigIntIDToXY, xyToBigIntID, type Monster, type MonsterList} from 'template-game-common';
import {evmGame} from '$lib/state/computed';
import {connection} from '$lib/state';
import {isBlockingMovement} from '$lib/tutorial';

export async function performAction(gameView: GameView, direction: {dx: number; dy: number}) {
	if (isBlockingMovement()) {
		return;
	}
	const $gameView = get(gameView);
	if (!$gameView.currentCharacter) {
		console.log('no current character');
		return;
	}
	const currentStateChanges = gameView.$state.currentStateChanges;
	if (!currentStateChanges) {
		return;
	}

	const origPosition = currentStateChanges?.newPosition
		? bigIntIDToXY(currentStateChanges.newPosition)
		: $gameView.characters[$gameView.currentCharacter].position;
	const newPosition = {x: origPosition.x + direction.dx, y: origPosition.y + direction.dy};

	const stateChanges = await evmGame.stepChanges(currentStateChanges, xyToBigIntID(newPosition.x, newPosition.y));
	console.log(`-----------------------------`);
	console.log(currentStateChanges);
	console.log(`=>`);
	console.log(stateChanges);
	console.log(`-----------------------------`);
	const pos = bigIntIDToXY(stateChanges.newPosition);
	memory.addMove({position: pos, type: 'move'}, stateChanges);

	camera.setTarget(pos.x, pos.y, camera.$store.zoom, 400);
}

export function reset(gameView: GameView) {
	const $gameView = get(gameView);
	if (!$gameView.currentCharacter) {
		console.log('no current character');
		return;
	}
	console.log('reseting...');
	if (memory.reset()) {
		// TODO DRY
		const currentStateChanges = gameView.$state.currentStateChanges;
		const origPosition = currentStateChanges?.newPosition
			? bigIntIDToXY(currentStateChanges.newPosition)
			: $gameView.characters[$gameView.currentCharacter].position;
		const position = {x: origPosition.x, y: origPosition.y};
		console.log({position});
		camera.setTarget(position.x, position.y, camera.$store.zoom, 400);
	}
}

export function rewind(gameView: GameView) {
	const $gameView = get(gameView);
	if (!$gameView.currentCharacter) {
		console.log('no current character');
		return;
	}
	console.log('rewinding...');
	if (memory.rewind()) {
		// TODO DRY
		const currentStateChanges = gameView.$state.currentStateChanges;
		const origPosition = currentStateChanges?.newPosition
			? bigIntIDToXY(currentStateChanges.newPosition)
			: $gameView.characters[$gameView.currentCharacter].position;
		const position = {x: origPosition.x, y: origPosition.y};
		console.log({position});
		camera.setTarget(position.x, position.y, camera.$store.zoom, 400);
	}
}

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
		if (ev.code === 'Space') {
			reset(this.gameView);
			return;
		}
		if (ev.code === 'Backspace') {
			rewind(this.gameView);
			return;
		}

		if (ev.code === 'ArrowUp') {
			performAction(this.gameView, {dx: 0, dy: -1});
		} else if (ev.code === 'ArrowDown') {
			performAction(this.gameView, {dx: 0, dy: +1});
		} else if (ev.code === 'ArrowLeft') {
			performAction(this.gameView, {dx: -1, dy: 0});
		} else if (ev.code === 'ArrowRight') {
			performAction(this.gameView, {dx: 1, dy: 0});
		}
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
