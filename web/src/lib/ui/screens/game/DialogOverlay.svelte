<script lang="ts">
	import {camera} from '$lib/render/camera';
	import type {GameView} from '$lib/state/ViewState';
	import {memory} from '$lib/state/memory';
	import {onMount} from 'svelte';
	import {fly} from 'svelte/transition';

	export let gameView: GameView;

	function nextTutorial() {
		memory.tutorialNext();
		const {x, y} = gameView.$state.characters[gameView.$state.currentCharacter!].position;
		camera.setTarget(x, y, camera.$store.zoom, 800);
	}

	onMount(() => {
		camera.navigate(0, 3, 50);
	});
</script>

<div class="content" transition:fly={{duration: 500, y: '100%'}}>
	<p>
		<img src="/images/ui/portraits/port_war_6x.png" alt="profile" />At last, I'm face-to-face with Ethernal's fabled
		entrance. This magical portal whose light help us see is my doorway to the catacombs and all the secrets they hold.
		I've come this far – now it's time to step into the unknown and unravel the mysteries of this ancient underground
		realm.
	</p>
	<div class="actions">
		<button on:click={nextTutorial}>Continue</button>
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
</style>
