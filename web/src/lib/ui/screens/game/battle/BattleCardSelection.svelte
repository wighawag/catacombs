<script lang="ts">
	import {memory} from '$lib/state/memory';

	$: attackSelection = $memory.inBattle?.cards.choicePresented == 'attack';

	function pickCard(index: number) {
		if (attackSelection) {
			memory.selectAttackCard(index);
		} else {
			memory.selectDefenseCard(index);
		}
	}
</script>

<div class="cards">
	<div class="enemy">
		{#if attackSelection}
			<button class="card">+0 / +0</button>
			<button class="card">+1 / +0</button>
		{:else}
			<button class="card">+2 / +1</button>
			<button class="card">+1 / +1</button>
		{/if}
	</div>
	<hr />
	<div class="hero">
		{#if attackSelection}
			<button on:click={() => pickCard(0)} class="card">+4 / +2</button>
			<button on:click={() => pickCard(1)} class="card">+2 / +1</button>
		{:else}
			<button on:click={() => pickCard(0)} class="card">+3 / +3</button>
			<button on:click={() => pickCard(1)} class="card">+1 / +2</button>
		{/if}
	</div>
</div>

<style>
	hr {
		width: 100%;
	}
	.cards {
		display: flex;
		gap: 1rem;
		background-color: #122;
		width: 70%;
		height: 16rem;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	.enemy,
	.hero {
		display: flex;
		gap: 1rem;
	}
	.card {
		padding: 1rem;
		border: 2px solid white;
		background-color: black;
		color: white;
		border-radius: 0;
		height: 64px;
		width: 128px;
	}

	.enemy .card {
		pointer-events: none;
		background-color: #122;
	}
</style>
