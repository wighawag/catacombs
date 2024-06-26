<script lang="ts">
	import WebGlCanvas from '$lib/render/WebGLCanvas.svelte';
	import {type GameView} from '$lib/state/ViewState';
	import {memory} from '$lib/state/memory';
	import WelcomeProfile from '../headers/WelcomeProfile.svelte';
	import Overlay from './Overlay.svelte';
	export let gameView: GameView;
</script>

<header>
	<WelcomeProfile {gameView} />
</header>

<main>
	<div style="width:100%; height: 100%; position: relative;">
		<div class="canvas">
			<WebGlCanvas state={gameView} />
		</div>
		<div
			id="game-overlay"
			style="position: absolute; top:0; left:0; width:100%; height: 100%; pointer-events: none; overflow: hidden;"
		>
			<Overlay {gameView} />
		</div>
	</div>
</main>

<footer>
	<!-- <p>
		Follow
		<a href="https://twitter.com/etherplay" target="_blank" rel="noopener noreferrer">@Etherplay</a>
		for updates
	</p> -->
	<div class="actions">
		<div class="rewind">
			<button on:click={() => memory.reset()}>&lt;&lt;</button>
			<button on:click={() => memory.rewind()}>&lt;</button>
		</div>
	</div>
</footer>

<style>
	.canvas {
		pointer-events: none;
		/* position: absolute; */
		/* top: 0;
		left: 0; */
		height: 100%;
		width: 100%;
	}

	.actions {
		width: 100%;
		display: flex;
	}
	.rewind {
		display: flex;
		width: 100%;
		gap: 1rem;
		justify-content: end;
	}
</style>
