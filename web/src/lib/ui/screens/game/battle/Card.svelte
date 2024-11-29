<script lang="ts">
	import IconSkull from '$data/assets/skull-key-white.png'; // TODO remove ?
	import type {MouseEventHandler} from 'svelte/elements';
	import type {CurrentCard} from 'template-game-common';

	interface Props {
		card: CurrentCard;
		disabled?: boolean;
		red?: boolean;
		hilighted?: boolean;
		onclick?: MouseEventHandler<HTMLButtonElement>;
	}

	let {card, disabled = false, red = false, hilighted = false, onclick}: Props = $props();
</script>

<button class="card" class:disabled class:red class:hoverable={!disabled && !hilighted} class:hilighted {onclick}>
	<div class="top">
		<div>{card.type == 'attack' ? 'ATK' : 'DEF'}</div>
		<div>{card.type == 'attack' ? card.atk : card.def}</div>
	</div>
	<div class="center"><img alt="defense" src={IconSkull} /></div>
	<div class="bottom">
		<div>{card.type == 'attack' ? card.dmg : card.armor}</div>
		<div class="bonus">{card.type == 'attack' ? 'DMG' : 'ARMOR'}</div>
	</div>
</button>

<style>
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
	}

	.hilighted {
		transform: scale(1.5);
		z-index: 3;
	}
	.hoverable:hover {
		transform: scale(1.2);
		transition-duration: 0.1s;
		z-index: 2;
	}
	.red {
		border: red solid 2px;
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
