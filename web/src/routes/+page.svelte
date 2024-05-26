<script lang="ts">
	import {gameView} from '$lib/state/ViewState';
	import WebGlCanvas from '$lib/render/WebGLCanvas.svelte';
	import InfoBar from '$lib/ui/components/InfoBar.svelte';
	import MintAndJoinPanel from '$lib/actions/mintAndJoin/MintAndJoinPanel.svelte';
</script>

<div style="position: absolute; z-index: 1; width: 100%; height: 100%; pointer-events: none;">
	<div class="info-bar">
		<InfoBar></InfoBar>
	</div>

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
</style>
