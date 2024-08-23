<script lang="ts">
	import {portrait} from '$lib/data/characters';
	import BorderedContainer from '$lib/ui/components/BorderedContainer.svelte';
	import HPBar from '$lib/ui/components/HPBar.svelte';
	import BattleCardSelection from './BattleCardSelection.svelte';
	import {evmGame} from '$lib/state/computed';
	import type {GameView} from '$lib/state/ViewState';
	import {intro} from '$lib/state/intro';
	import {accountState} from '$lib/state/AccountState';

	const offchainState = accountState.offchainState;

	export let gameView: GameView;
	$: characterClass = $intro.character?.classIndex || 0;
	$: classPortrait = portrait(characterClass);
	$: characterClassName = characterClass === 0 ? 'Barbarian' : 'Unknown';

	$: xp = $gameView && $gameView.currentCharacter ? $gameView.currentCharacter.xp : 0;
	$: hp = $gameView && $gameView.currentCharacter ? $gameView.currentCharacter.hp : 0;

	async function battleWith(attackCardIndex: number, defenseCardIndex: number) {
		const currentStateChanges = gameView.$state.currentStateChanges;
		if (!currentStateChanges) {
			return;
		}
		const context = gameView.$state.context;
		if (!context) {
			return;
		}
		const action = (1n << 248n) | BigInt(attackCardIndex << 8) | BigInt(defenseCardIndex);
		console.log(action.toString(16));
		console.log(`-----------------------------`);
		console.log(currentStateChanges);
		const stateChanges = await evmGame.stepChanges(currentStateChanges, context, action);
		console.log(`=>`);
		console.log(stateChanges);
		console.log(`-----------------------------`);
		accountState.addMove(
			{
				type: 'battle',
				attackCardIndex,
				defenseCardIndex,
			},
			stateChanges,
		);
		if (stateChanges.battle.monsterIndexPlus1 == 0) {
			accountState.acceptEnd();
		}
	}

	async function confirm() {
		if ($offchainState.inBattle?.cards.attackChosen && $offchainState.inBattle?.cards.defenseChosen) {
			battleWith(
				$offchainState.inBattle.cards.attackChosen.cardIndex,
				$offchainState.inBattle.cards.defenseChosen.cardIndex,
			);
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
	{#if $offchainState.inBattle?.cards.attackChosen && $offchainState.inBattle?.cards.defenseChosen}
		<div class="confirmation">
			<button on:click={confirm}>Confirm</button>
		</div>
	{/if}
	<div class="actions">
		<button
			on:click={() => {
				accountState.showChoice('attack');
			}}>Select Attack</button
		>
		<button
			on:click={() => {
				accountState.showChoice('defense');
			}}>Select Defense</button
		>
	</div>
	<div class="hero">
		<button class="icon">
			<img src={classPortrait} alt="profile" />
		</button>
		<div class="bar"><HPBar value={hp} maxValue={50} /></div>
	</div>

	{#if $offchainState.inBattle?.cards.choicePresented == 'attack'}
		<div class="selection-overlay"></div>
		<div class="selection-modal">
			<BattleCardSelection />
		</div>
	{:else if $offchainState.inBattle?.cards.choicePresented == 'defense'}
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
