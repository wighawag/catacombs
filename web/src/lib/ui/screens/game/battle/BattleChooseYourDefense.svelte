<script lang="ts">
	import Card from './Card.svelte';

	export let selected: number | undefined = undefined;
	export let cards: {defense: number; armor: number; used: boolean}[];
	export let enemy = false;
</script>

<div class="actions">
	{#each cards as card, i}
		<Card
			{enemy}
			value={card.defense}
			bonus={card.armor}
			disabled={(selected != undefined && i != selected) || card.used}
			hilighted={enemy && selected == i}
		/>
	{/each}
</div>

<style>
	.actions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		flex-wrap: wrap;
	}
</style>
