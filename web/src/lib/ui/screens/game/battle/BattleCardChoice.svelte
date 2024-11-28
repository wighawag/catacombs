<script lang="ts">
	import type {CurrentCard} from 'template-game-common';
	import Card from './Card.svelte';

	interface Props {
		selected?: number | undefined;
		cards: readonly CurrentCard[];
		enemy?: boolean;
	}

	let { selected = undefined, cards, enemy = false }: Props = $props();
</script>

<div class="actions">
	{#each cards as card, i}
		<Card
			{enemy}
			{card}
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
