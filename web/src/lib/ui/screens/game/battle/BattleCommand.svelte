<script lang="ts">
	import type {GameView} from '$lib/state/ViewState';
	import {accountState} from '$lib/state/AccountState';
	import BattleChooseYourDefense from './BattleChooseYourDefense.svelte';
	import {portrait} from '$lib/data/characters';
	import {intro} from '$lib/state/intro';
	import BorderedContainer from '$lib/ui/components/BorderedContainer.svelte';
	import HpBar from '$lib/ui/components/HPBar.svelte';

	export let gameView: GameView;
	$: characterClass = $intro.character?.classIndex || 0;
	$: classPortrait = portrait(characterClass);
	$: characterClassName = characterClass === 0 ? 'Barbarian' : 'Unknown';

	$: xp = $gameView && $gameView.currentCharacter ? $gameView.currentCharacter.xp : 0;
	$: hp = $gameView && $gameView.currentCharacter ? $gameView.currentCharacter.hp : 0;

	const offchainState = accountState.offchainState;

	let myCards = [
		{defense: 2, armor: 3, used: false},
		{defense: 2, armor: 3, used: false},
		{defense: 2, armor: 3, used: true},
		{defense: 2, armor: 3, used: false},
		{defense: 2, armor: 3, used: true},
		{defense: 2, armor: 3, used: false},
	];
	let monsterCards = [
		{defense: 2, armor: 3, used: true},
		{defense: 2, armor: 3, used: false},
		{defense: 2, armor: 3, used: false},
		{defense: 2, armor: 3, used: false},
	];
</script>

<div class="wrapper">
	<div class="centered">
		<BorderedContainer>Choose your defense!</BorderedContainer>
	</div>
	<div class="centered">
		<p>Skeleton</p>
		<div class="bar"><HpBar value={4} maxValue={4} /></div>
	</div>
	<div class="monster">
		<div class="monster-cards">
			<BattleChooseYourDefense cards={monsterCards} selected={2} enemy={true} />
		</div>

		<div class="monster-image">
			<img alt="skeleton" src="/images/monsters/skeleton.png" />
		</div>
	</div>

	{#if !$offchainState.inBattle?.cards.defenseChosen}
		<div class="player-choice">
			<BattleChooseYourDefense cards={myCards} />
		</div>
	{/if}

	<div class="hero">
		<button class="icon">
			<img src={classPortrait} alt="profile" />
		</button>
		<div class="bar"><HpBar value={hp} maxValue={50} /></div>
	</div>
</div>

<style>
	@keyframes border-pulsate {
		0% {
			border-color: rgba(100, 100, 100, 1);
		}
		50% {
			border-color: rgba(255, 255, 255, 0);
		}
		100% {
			border-color: rgba(100, 100, 100, 1);
		}
	}

	.player-choice {
		border: dashed 2px black;
		animation: border-pulsate 2s ease-in-out infinite;
		padding: 32px;
		margin-block: 8px;
		display: flex;
		justify-content: center;
	}

	.wrapper {
		width: 100%;
		height: 100%;
		background-color: black;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
	}

	.centered {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	/* .monster-cards {
		position: absolute;
		z-index: 2;
	} */

	.monster-image {
		display: flex;
		justify-content: center;
		/* background-color: red; */
	}

	.monster img {
		width: 15vh;
		min-width: 128px;
		aspect-ratio: 1;
		image-rendering: pixelated;
		filter: sepia() hue-rotate(50deg) brightness(80%);
		/* opacity: 0.7; */
	}

	.hero {
		display: flex;
		gap: 1rem;
		justify-content: center;
		align-items: center;
	}

	.hero img {
		height: 100%;
		width: 48px;
		border: 1px white dashed;
	}
	.bar {
		width: 10rem;
	}

	@media screen and (max-height: 700px) {
		.monster img {
			width: 150px;
			image-rendering: pixelated;
			filter: sepia() hue-rotate(50deg) brightness(80%);
			/* opacity: 0.7; */
		}
	}
</style>
