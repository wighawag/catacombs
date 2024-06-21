<script lang="ts">
	import WebGlCanvas from '$lib/render/WebGLCanvas.svelte';
	import {type GameView} from '$lib/state/ViewState';
	import WelcomeProfile from '../headers/WelcomeProfile.svelte';
	import Overlay from './Overlay.svelte';
	export let gameView: GameView;
</script>

<header>
	<WelcomeProfile />
</header>

<main>
	<div class="canvas">
		<WebGlCanvas state={gameView} />
	</div>
</main>

<footer>
	<p>
		Follow
		<a href="https://twitter.com/etherplay" target="_blank" rel="noopener noreferrer">@Etherplay</a>
		for updates
	</p>
</footer>

<Overlay {gameView} />

<style>
	.canvas {
		pointer-events: none;
		/* position: absolute; */
		/* top: 0;
		left: 0; */
		height: 100%;
		width: 100%;
	}
</style>
