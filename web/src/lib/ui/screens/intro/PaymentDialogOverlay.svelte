<script lang="ts">
	import {startEnter} from '$lib/actions/enter';
	import {portrait} from '$lib/data/characters';
	import type {GameView} from '$lib/state/ViewState';
	import {intro} from '$lib/state/intro';
	import {fly} from 'svelte/transition';

	// export let gameView: GameView;
	export let btnDisabled: boolean = false;

	async function enter(e: Event) {
		e.preventDefault();
		await startEnter();
	}
</script>

<div class="content" transition:fly={{duration: 500, y: '100%'}}>
	<p>
		<img src={portrait($intro.character?.classIndex || 0)} alt="profile" />
		You grab enough food to not worry for a while. The shop keeper watch with a smile, waiting impatiently for your coins.
	</p>
	<p class="warning">
		Remember, in Ethernal, your death is permanent. Losing your character will require you to pay for food once more.
		<span>Enter at your own risk.</span>
	</p>
	<!-- <p class="final">Enter at your own risk.</p> -->
	<div class="actions">
		<button disabled={btnDisabled} on:click={enter}>Pay 0.004 ETH</button>
	</div>
</div>

<style>
	/* .final {
		font-size: 1.3rem;
		text-align: center;
	} */
	.warning {
		color: var(--color-error-500);
		background-color: var(--color-surface-500);
	}
	.warning > span {
		font-weight: bolder;
	}
	.content {
		position: absolute;
		bottom: 0;
		padding: 2rem;
		width: 100%;
		height: 50%;
		background-color: #161616;
		border: 5px solid black;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	p {
		text-align: left;
	}

	img {
		width: 64px;
		display: inline-block;
		margin-right: 1rem;
	}

	.actions {
		display: flex;
		justify-content: center;
	}

	.actions button {
		width: 100%;
		height: 2rem;
		font-size: 1.2rem;
		background-color: var(--color-error-500);
		color: var(--color-primary-500);
	}

	@media screen and (max-height: 700px) {
		p {
			font-size: 12px;
		}

		img {
			width: 32px;
		}
	}
</style>
