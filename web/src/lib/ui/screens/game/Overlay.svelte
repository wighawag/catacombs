<script lang="ts">
	import {performAction} from '$lib/actions/ActionHandler';
	import {type GameView} from '$lib/state/ViewState';
	import BattleOverlay from './BattleOverlay.svelte';
	import DialogOverlay from './DialogOverlay.svelte';
	export let gameView: GameView;

	function move(direction: {dx: number; dy: number}) {
		performAction(gameView, direction);
	}
</script>

{#if $gameView.memory.tutorialStep == 0}
	<DialogOverlay {gameView} />
{:else if $gameView.inBattle}
	<BattleOverlay {gameView} />
{:else}
	<div class="navigation">
		<div class="north"><button on:click={() => move({dx: 0, dy: -1})}>N</button></div>
		<div class="west-south-east">
			<button on:click={() => move({dx: -1, dy: 0})}>W</button>
			<button on:click={() => move({dx: 0, dy: +1})}>S</button>
			<button on:click={() => move({dx: +1, dy: 0})}>E</button>
		</div>
	</div>
{/if}

<style>
	.navigation {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-content: flex-start;
		position: absolute;
		bottom: 0;
		right: 0;
		width: 14rem;
	}
	.north {
		display: flex;
		justify-content: center;
		flex-basis: 100%;
		gap: 1rem;
	}
	.west-south-east {
		display: flex;
		justify-content: center;
		flex-basis: 100%;
		gap: 1rem;
	}
	button {
		width: 4rem;
		height: 4rem;
		background-color: black;
		opacity: 0.65;
		border: 2px solid white;
		color: white;
	}
</style>
