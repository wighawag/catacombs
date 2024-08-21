import {camera} from '$lib/render/camera';
import type {GameView} from '$lib/state/ViewState';

// TODO make it a store
let _blocked = false;
export function isBlockingMovement() {
	return _blocked;
}

export function setInitialCamera() {
	camera.navigate(0, 3, 50);
	_blocked = true;
}

export function endInitialCamera(gameView: GameView) {
	const {x, y} = gameView.$state.currentCharacter!.position;
	camera.setTarget(x, y, camera.$store.zoom, 800);
	_blocked = false;
}
