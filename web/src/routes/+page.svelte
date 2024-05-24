<script lang="ts">
	import {gameView} from '$lib/state/ViewState';
	import WebGlCanvas from '$lib/render/WebGLCanvas.svelte';
</script>

<div class="canvas">
	<WebGlCanvas state={gameView} />
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
