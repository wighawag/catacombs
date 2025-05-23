<script lang="ts">
	import {ActionHandler} from '$lib/actions/ActionHandler';
	import {onMount} from 'svelte';
	import {camera} from './camera';
	import {WebGLRenderer} from './WebGLRenderer';
	import type {GameView} from '$lib/state/ViewState';
	interface Props {
		gameView: GameView;
	}

	let {gameView}: Props = $props();

	let renderer: WebGLRenderer = new WebGLRenderer();
	function render(time: number) {
		renderer.render(time);
		animationFrameID = requestAnimationFrame(render);
	}

	let animationFrameID: number;
	let unsubscribeFromCamera: () => void;
	let unsubscribeFromState: () => void;

	let error: string | undefined = $state();
	onMount(() => {
		const canvas = document.querySelector('#world-map') as HTMLCanvasElement;

		// prevent selection of text when start dragging on canvas
		// TODO we should actually disable pointer events for all elements in the way
		//   and reenable when dragging on canvas stop
		canvas.onselectstart = () => false;

		// const gl = canvas.getContext('webgl2', {alpha: false});
		const gl = canvas.getContext('webgl2');
		if (!gl) {
			error = `could not create WebGL2 context`;
			throw new Error(error);
		}

		renderer.initialize(canvas, gl);

		camera.start(canvas, renderer);
		unsubscribeFromCamera = camera.subscribe((v) => renderer.updateView(v));

		const actionHandler = new ActionHandler();
		actionHandler.start(camera, canvas, gameView);

		unsubscribeFromState = gameView.subscribe(($gameView) => {
			renderer.updateState($gameView);
		});

		animationFrameID = requestAnimationFrame(render);

		return () => {
			actionHandler.stop();
			camera.stop();
			cancelAnimationFrame(animationFrameID);
			unsubscribeFromCamera();
			unsubscribeFromState();
		};
	});
</script>

{#if error}
	{error}
{:else}
	<div style="width:100%; height: 100%; position: relative;">
		<canvas id="world-map" style="background-color: #000; width:100%; height: 100%; pointer-events: auto;"></canvas>
		<div
			id="canvas-overlay"
			style="position: absolute; top:0; left:0; width:100%; height: 100%; pointer-events: none; overflow: hidden;"
		></div>
	</div>
{/if}
