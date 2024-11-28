<script lang="ts">
	import {fade} from 'svelte/transition';
	import {splash} from './splash';
	import {onMount} from 'svelte';
	import {url} from '$utils/path';
	import type {Action} from 'svelte/action';

	let gameTitle: HTMLImageElement;
	onMount(() => {
		splash.start();
		if ((gameTitle as any)._loaded) {
			splash.gameLogoReady();
		}
	});

	const onload: Action<HTMLImageElement> = (node) => {
		(node as any)._loaded = false;
		node.addEventListener('load', () => {
			(node as any)._loaded = true;
			splash.gameLogoReady();
		});
	};
</script>

{#if $splash && $splash.stage === 0}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="overlay game-title" out:fade on:click={() => splash.nextStage()}>
		<div class="content">
			<!-- see https://github.com/sveltejs/svelte/issues/11624 -->
			<img src={url('/title.png')} alt="Game title" use:onload bind:this={gameTitle} />
			<p class="description">Enter at your own risk</p>
			<!-- <p class="information">Loading...</p> -->
			<!-- <progress style="--color: red;" /> -->
		</div>
	</div>
{/if}

<style>
	.overlay {
		overflow-y: auto;
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 50;
		background-color: #000000;

		height: 100%;
	}

	.overlay.game-title {
		background-color: var(--color-surface-500);
	}

	.game-title .content {
		margin-top: 8rem;
		text-align: center;
		justify-content: center;
	}

	.game-title img {
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 2rem;
		max-width: 28rem;

		width: 80%;
	}

	.game-title .description {
		margin: 1.5rem;
		margin-top: 5rem;
		color: #6b7280;
		font-size: 1.5rem;
		line-height: 2rem;
		font-weight: 900;
	}

	.game-title .information {
		margin: 1.5rem;
		margin-top: 10rem;
		color: #6b7280;
		font-size: 1rem;
		line-height: 2rem;
		font-weight: 900;
	}
</style>
