<script lang="ts">
	import type {CurrentCard} from 'template-game-common';
	import Card from './Card.svelte';

	interface Props {
		attack: CurrentCard;
		defense: CurrentCard;
		enemy?: boolean;
	}

	let {attack, defense, enemy = false}: Props = $props();
</script>

<div class="actions">
	{#if enemy}
		<Card card={defense} red={enemy} />
		<Card card={attack} red={enemy} />
	{:else}
		<Card card={attack} red={enemy} />
		<Card card={defense} red={enemy} />
	{/if}
</div>

<style>
	.actions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		flex-wrap: wrap;
	}
</style>
