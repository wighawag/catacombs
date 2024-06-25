<script lang="ts">
	import type {GameView} from '$lib/state/ViewState';
	import {evmGame} from '$lib/state/computed';
	import {memory} from '$lib/state/memory';
	import {fade} from 'svelte/transition';

	export let gameView: GameView;

	async function battleWith(attackCardIndex: number, defenseCardIndex: number) {
		const currentStateChanges = gameView.$state.currentStateChanges;
		if (!currentStateChanges) {
			return;
		}
		const action = (1n << 248n) | BigInt(attackCardIndex << 8) | BigInt(defenseCardIndex);
		console.log(action.toString(16));
		console.log(`-----------------------------`);
		console.log(currentStateChanges);
		const stateChanges = await evmGame.stepChanges(currentStateChanges, action);
		console.log(`=>`);
		console.log(stateChanges);
		console.log(`-----------------------------`);
		memory.addMove(
			{
				type: 'battle',
				attackCardIndex,
				defenseCardIndex,
			},
			stateChanges,
		);
	}
</script>

<div class="content" transition:fade={{delay: 300}}>
	{#if $gameView.memory.step == 0}
		<div class="text">A skeleton jumped out from the corner of the room.</div>
		<div class="monster">
			<img alt="skeleton" src="/images/monsters/skeleton.png" />
		</div>
		<div class="actions">
			<button on:click={() => memory.next()}>Battle!</button>
		</div>
	{:else}
		<div class="text">Chose your cards wisely!</div>
		<div class="monster">
			<img alt="skeleton" src="/images/monsters/skeleton.png" />
		</div>
		<div class="actions">
			<button on:click={() => battleWith(0, 0)}>card 1</button>
			<button on:click={() => battleWith(1, 1)}>card 2</button>
		</div>
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
