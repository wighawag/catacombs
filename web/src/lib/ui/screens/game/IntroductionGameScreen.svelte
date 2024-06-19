<script lang="ts">
	import WebGLCanvas from '$lib/render/WebGLCanvas.svelte';
	import {gameView} from '$lib/state/ViewState';
</script>

<div class="canvas">
	<WebGLCanvas state={gameView} />
</div>

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
