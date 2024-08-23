<script lang="ts">
	import {portrait} from '$lib/data/characters';
	import {accountState} from '$lib/state/AccountState';
	import type {GameView} from '$lib/state/ViewState';
	import {intro} from '$lib/state/intro';
	import {endBlock, endInitialCamera, setInitialCamera} from '$lib/tutorial';
	import {onDestroy, onMount} from 'svelte';
	import {fly} from 'svelte/transition';

	export let gameView: GameView;
	export let btnDisabled: boolean = false;

	function nextTutorial() {
		accountState.tutorialNext();
		if (accountState.$offchainState.tutorialStep == 1) {
			endInitialCamera(gameView);
		}
	}

	onMount(() => {
		setInitialCamera();
	});

	onDestroy(() => {
		endBlock();
	});
</script>

<div class="content" transition:fly={{duration: 500, y: '100%'}}>
	<p>
		<img src={portrait($intro.character?.classIndex || 0)} alt="profile" />
		<slot></slot>
	</p>
	<div class="actions">
		<button disabled={btnDisabled} on:click={nextTutorial}>Continue</button>
	</div>
</div>

<style>
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
