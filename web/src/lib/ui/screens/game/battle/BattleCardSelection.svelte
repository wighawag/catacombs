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
	<Card card={attack} red={enemy} />
	<Card card={defense} red={enemy} />
</div>

<style>
	.actions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		flex-wrap: wrap;
	}
</style>
