<script lang="ts">
	import type {GameView} from '$lib/state/ViewState';
	import {fade} from 'svelte/transition';
	import BattleRoundResult from './battle/BattleRoundResult.svelte';
	import {accountState} from '$lib/state/AccountState';
	import BattleCommand from './battle/BattleCommand.svelte';

	interface Props {
		gameView: GameView;
	}

	let {gameView}: Props = $props();
</script>

<div class="content" in:fade={{delay: 300}}>
	{#if !$gameView.offchainState?.inBattle?.accepted}
		<div class="text">A skeleton jumped out from the corner of the room.</div>
		<div class="monster">
			<img alt="skeleton" src="/images/monsters/skeleton.png" />
		</div>
		<div class="actions">
			<button onclick={() => accountState.acceptBattle(gameView.$state.stage)}>Battle!</button>
		</div>
	{:else if !$gameView.offchainState?.inBattle?.cards.confirmed}
		<BattleCommand {gameView} />
	{:else if !$gameView.offchainState?.inBattle.resultAccepted}
		<BattleRoundResult />
	{:else if !$gameView.offchainState?.inBattle.resultAccepted}
		<button onclick={() => accountState.acceptBattleResult($gameView)}>Continue</button>
	{/if}
</div>

<style>
	.content {
		padding: 2rem;
		width: 100%;
		height: 100%;
		background-color: black;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		overflow-y: auto;
		pointer-events: all;
	}

	.text {
		display: flex;
		justify-content: center;
	}

	.monster {
		display: flex;
		justify-content: center;
		/* background-color: red; */
	}

	.monster img {
		width: 256px;
		image-rendering: pixelated;
		filter: sepia() hue-rotate(50deg) brightness(80%);
		/* opacity: 0.7; */
	}

	.actions {
		display: flex;
		justify-content: center;
	}

	.actions button {
		width: 100%;
		height: 2rem;
		font-size: 1.2rem;
	}
</style>
