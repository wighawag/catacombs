<script lang="ts">
	import {portrait} from '$lib/data/characters';
	import {memory} from '$lib/state/memory';
	import BorderedContainer from '$lib/ui/components/BorderedContainer.svelte';
	import HPBar from '$lib/ui/components/HPBar.svelte';
	import BattleCardSelection from './BattleCardSelection.svelte';
	import {evmGame} from '$lib/state/computed';
	import type {GameView} from '$lib/state/ViewState';
	import {intro} from '$lib/state/intro';

	export let gameView: GameView;
	$: characterClass = $intro.character?.classIndex || 0;
	$: classPortrait = portrait(characterClass);
	$: characterClassName = characterClass === 0 ? 'Barbarian' : 'Unknown';

	async function battleWith(attackCardIndex: number, defenseCardIndex: number) {
		const currentStateChanges = gameView.$state.currentStateChanges;
		if (!currentStateChanges) {
			return;
		}
		const action = (1n << 248n) | BigInt(attackCardIndex << 8) | BigInt(defenseCardIndex);
		console.log(action.toString(16));
		console.log(`-----------------------------`);
		console.log(currentStateChanges);
		const stateChanges = await evmGame.stepChanges(currentStateChanges, action);
		console.log(`=>`);
		console.log(stateChanges);
		console.log(`-----------------------------`);
		memory.addMove(
			{
				type: 'battle',
				attackCardIndex,
				defenseCardIndex,
			},
			stateChanges,
		);
		if (stateChanges.battle.monsterIndexPlus1 == 0) {
			memory.acceptEnd();
		}
	}

	async function confirm() {
		if ($memory.inBattle?.cards.attackChosen && $memory.inBattle?.cards.defenseChosen) {
			battleWith($memory.inBattle.cards.attackChosen.cardIndex, $memory.inBattle.cards.defenseChosen.cardIndex);
		}
	}
</script>

<div class="wrapper">
	<div class="centered">
		<BorderedContainer>Choose your card wisely!</BorderedContainer>
	</div>
	<div class="centered">
		<p>Skeleton</p>
		<div class="bar"><HPBar value={4} maxValue={4} /></div>
	</div>
	<div class="monster">
		<img alt="skeleton" src="/images/monsters/skeleton.png" />
	</div>
	{#if $memory.inBattle?.cards.attackChosen && $memory.inBattle?.cards.defenseChosen}
		<div class="confirmation">
			<button on:click={confirm}>Confirm</button>
		</div>
	{/if}
	<div class="actions">
		<button
			on:click={() => {
				memory.showChoice('attack');
			}}>Select Attack</button
		>
		<button
			on:click={() => {
				memory.showChoice('defense');
			}}>Select Defense</button
		>
	</div>
	<div class="hero">
		<button class="icon">
			<img src={classPortrait} alt="profile" />
		</button>
		<div class="bar"><HPBar value={50} maxValue={50} /></div>
	</div>

	{#if $memory.inBattle?.cards.choicePresented == 'attack'}
		<div class="selection-overlay"></div>
		<div class="selection-modal">
			<BattleCardSelection />
		</div>
	{:else if $memory.inBattle?.cards.choicePresented == 'defense'}
		<div class="selection-overlay"></div>
		<div class="selection-modal">
			<BattleCardSelection />
		</div>
	{/if}
</div>

<style>
	.wrapper {
		width: 100%;
		height: 100%;
		background-color: black;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
	}

	.selection-modal {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.selection-overlay {
		background-color: black;
		opacity: 0.3;
		position: absolute;
		width: 100%;
		height: 100%;
	}

	.confirmation {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.centered {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	.monster {
		display: flex;
		justify-content: center;
		/* background-color: red; */
	}

	.monster img {
		width: 256px;
		image-rendering: pixelated;
		filter: sepia() hue-rotate(50deg) brightness(80%);
		/* opacity: 0.7; */
	}

	.actions {
		display: flex;
		gap: 8rem;
		justify-content: center;
	}

	.actions button {
		width: 100%;
		height: 2rem;
		font-size: 1.2rem;
		color: white;
		background-color: transparent;
		border: 3px solid white;
		height: 6rem;
		width: 6rem;
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

		.actions button {
			font-size: 1rem;
			height: 3rem;
		}
	}
</style>
