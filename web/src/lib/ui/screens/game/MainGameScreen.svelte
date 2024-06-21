<script lang="ts">
	import WebGlCanvas from '$lib/render/WebGLCanvas.svelte';
	import {type GameView} from '$lib/state/ViewState';
	import Overlay from './Overlay.svelte';
	export let gameView: GameView;
</script>

<div class="canvas">
	<WebGlCanvas state={gameView} />
</div>

<Overlay {gameView} />

<style>
	.canvas {
		pointer-events: none;
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
	}
</style>
