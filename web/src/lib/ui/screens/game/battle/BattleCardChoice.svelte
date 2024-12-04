<script lang="ts">
	import type {CurrentCard} from 'template-game-common';
	import Card from './Card.svelte';

	interface Props {
		selected?: number | undefined;
		cards: readonly CurrentCard[];
		onselected?: (card: CurrentCard, index: number) => void;
		position?: 'top' | 'bottom';
	}

	let {selected = undefined, cards, onselected, position}: Props = $props();
</script>

<div class="actions">
	{#each cards as card, i}
		{@const disabled = (selected != undefined && i != selected) || card.used}
		<Card
			position={!disabled ? position : undefined}
			onclick={() => onselected?.(card, i)}
			{card}
			{disabled}
			hilighted={selected == i}
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
