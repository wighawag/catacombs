<script lang="ts">
	import IconSkull from '$data/assets/skull-key-white.png'; // TODO remove ?
	import type {MouseEventHandler} from 'svelte/elements';
	import type {CurrentCard} from 'template-game-common';

	interface Props {
		card: CurrentCard;
		disabled?: boolean;
		hilighted?: boolean;
		onclick?: MouseEventHandler<HTMLButtonElement>;
		position?: 'top' | 'bottom';
	}

	let {card, disabled = false, hilighted = false, onclick, position}: Props = $props();
</script>

{#snippet arrow(flip: boolean)}
	<svg
		width="24px"
		height="24px"
		stroke-width="1.5"
		viewBox="0 0 24 24"
		fill="#ffffff"
		xmlns="http://www.w3.org/2000/svg"
		color="#ffffff"
		><path
			d="M3.68478 18.7826L11.5642 4.77473C11.7554 4.43491 12.2446 4.43491 12.4358 4.77473L20.3152 18.7826C20.5454 19.1918 20.1357 19.6639 19.6982 19.4937L12.1812 16.5705C12.0647 16.5251 11.9353 16.5251 11.8188 16.5705L4.30179 19.4937C3.86426 19.6639 3.45463 19.1918 3.68478 18.7826Z"
			stroke="#000000"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		></path></svg
	>
{/snippet}

<button class="card" class:disabled class:hoverable={!disabled && !hilighted} class:hilighted {onclick}>
	{#if position == 'bottom' && card.type == 'attack'}
		<div class="top-arrow">
			{@render arrow(false)}
		</div>
	{/if}
	<div class="top">
		<div>{card.type == 'attack' ? 'ATK' : 'DEF'}</div>
		<div>{card.type == 'attack' ? card.atk : card.def}</div>
	</div>
	<div class="center"><img alt="defense" src={IconSkull} /></div>
	<div class="bottom">
		<div>{card.type == 'attack' ? card.dmg : card.armor}</div>
		<div class="bonus">{card.type == 'attack' ? 'DMG' : 'ARMOR'}</div>
	</div>
	{#if position == 'top' && card.type == 'attack'}
		<div class="bottom-arrow">{@render arrow(false)}</div>
	{/if}
</button>

<style>
	.top-arrow {
		position: absolute;
		margin-top: -24px;
	}
	.bottom-arrow {
		position: absolute;
		margin-top: 56px;
		transform: scale(1, -1);
	}
	.card {
		background-color: black;
		color: white;
		font-size: smaller;
		width: 64px;
		height: 64px;
		border: gray solid 2px;
		padding: 0.1rem 0.1rem 0rem 0.1rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
	}

	.hilighted {
		transform: scale(1.5);
	}
	.hoverable:hover {
		transform: scale(1.2);
		transition-duration: 0.1s;
		z-index: 2;
	}
	.center {
		width: 100%;
		display: flex;
		display: flex;
		justify-content: center;
	}
	.center img {
		width: 20px;
		height: 20px;
	}
	.disabled {
		opacity: 0.3;
	}
	.top {
		width: 100%;
		display: flex;
		justify-content: space-between;
	}
	.bottom {
		display: flex;
		justify-content: space-between;
		align-items: end;
	}
	.bonus {
		color: #5a5a5a;
		font-size: x-small;
	}
</style>
