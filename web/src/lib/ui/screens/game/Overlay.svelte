<script lang="ts">
	import {performAction} from '$lib/actions/ActionHandler';
	import {type GameView} from '$lib/state/ViewState';
	import BattleOverlay from './BattleOverlay.svelte';
	interface Props {
		gameView: GameView;
	}

	let {gameView}: Props = $props();

	function move(direction: {dx: number; dy: number}) {
		performAction(gameView, direction);
	}

	$effect(() => {
		console.log({inBattle: $gameView.inBattle});
	});
</script>

{#if $gameView.inBattle || ($gameView.offchainState?.inBattle?.accepted && !$gameView.offchainState?.inBattle?.endAccepted)}
	<BattleOverlay {gameView} />
{:else}
	<div class="navigation">
		<div class="north"><button onclick={() => move({dx: 0, dy: -1})}>N</button></div>
		<div class="west-south-east">
			<button onclick={() => move({dx: -1, dy: 0})}>W</button>
			<button onclick={() => move({dx: 0, dy: +1})}>S</button>
			<button onclick={() => move({dx: +1, dy: 0})}>E</button>
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
