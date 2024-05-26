<script lang="ts">
	import {gameView} from '$lib/state/ViewState';
	import WebGlCanvas from '$lib/render/WebGLCanvas.svelte';
	import Header from '$lib/ui/header/Header.svelte';
	import InfoBar from '$lib/ui/components/InfoBar.svelte';
	import MintAndJoinPanel from '$lib/actions/mintAndJoin/MintAndJoinPanel.svelte';
</script>

<div style="position: absolute; z-index: 1; width: 100%; height: 100%; pointer-events: none;">
	<Header>
		<div class="info-bar">
			<InfoBar></InfoBar>
		</div>
	</Header>

	{#if !$gameView.currentCharacter}
		<MintAndJoinPanel />
	{/if}
</div>

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

	.info-bar {
		pointer-events: auto;
		background-color: hsl(217 70% 20%); /*var(--color-surface-800);*/
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
		padding: 1rem;

		width: 100%;
	}
</style>
