<script lang="ts">
	import {start} from '.';

	async function mintAndJoin() {
		await start();
	}
</script>

<div class="panel">
	<button on:click={mintAndJoin}>Enter</button>
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		background-color: var(--color-surface-500);
		border: 16px solid var(--color-text-on-surface);
		border-image: url(/game-assets/ui/border.png) 16 repeat;
		image-rendering: pixelated;
	}
</style>
