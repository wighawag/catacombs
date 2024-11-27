<script lang="ts">
	import Card from './Card.svelte';

	export let selected: number | undefined = undefined;
	export let cards: {defense: number; armor: number}[];
	export let enemy = false;
</script>

<div class="actions">
	{#each cards as card, i}
		<Card {enemy} value={card.defense} bonus={card.armor} disabled={selected != undefined && i != selected} />
	{/each}
</div>

<style>
	.actions {
		display: flex;
		gap: 0.2rem;
		justify-content: center;
		flex-wrap: wrap;
	}
</style>
