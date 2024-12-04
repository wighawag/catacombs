<script lang="ts">
	import type {CurrentCard} from 'template-game-common';
	import Card from './Card.svelte';

	interface Props {
		attack: CurrentCard;
		defense: CurrentCard;
	}

	let {attack, defense}: Props = $props();
</script>

<div class="actions">
	<Card card={defense} />
	<Card card={attack} />
</div>

<style>
	.actions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		flex-wrap: wrap;
	}
</style>
