<script lang="ts">
	import WebGlCanvas from '$lib/render/WebGLCanvas.svelte';
	import {accountState} from '$lib/state/AccountState';
	import {type GameView} from '$lib/state/ViewState';
	import WelcomeProfile from '../headers/WelcomeProfile.svelte';
	import IntroOverlay from '../intro/IntroOverlay.svelte';
	import Overlay from './Overlay.svelte';
	interface Props {
		gameView: GameView;
	}

	let {gameView}: Props = $props();
</script>

<header>
	<WelcomeProfile {gameView} />
</header>

<main>
	<div style="width:100%; height: 100%; position: relative;">
		<div class="canvas">
			<WebGlCanvas {gameView} />
		</div>
		<div
			id="game-overlay"
			style="position: absolute; top:0; left:0; width:100%; height: 100%; pointer-events: none; overflow: hidden;"
		>
			{#if $gameView.stage === 'intro'}
				<IntroOverlay {gameView} />
			{:else if $gameView.stage === 'game'}
				<Overlay {gameView} />
			{:else if $gameView.stage === 'pending'}
				<div style="background-color: red;width: 100%; height: 100%; position: fixed; top: 0; left: 0;">Pending...</div>
			{/if}
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
			<button onclick={() => accountState.endTutorial()}>J</button>
			<button onclick={() => accountState.resetMoves(gameView.$state.stage)}>&lt;&lt;</button>
			<button onclick={() => accountState.rewindMoves(gameView.$state.stage)}>&lt;</button>
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
