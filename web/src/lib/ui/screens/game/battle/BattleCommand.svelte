<script lang="ts">
	import type {GameView} from '$lib/state/ViewState';
	import {accountState} from '$lib/state/AccountState';
	import BattleCardChoice from './BattleCardChoice.svelte';
	import {portrait} from '$lib/data/characters';
	import {intro} from '$lib/state/intro';
	import BorderedContainer from '$lib/ui/components/BorderedContainer.svelte';
	import HpBar from '$lib/ui/components/HPBar.svelte';
	import {battleState} from '$lib/state/BattleState';
	import type {CurrentCard} from 'template-game-common';
	import BattleCardSelection from './BattleCardSelection.svelte';
	import Card from './Card.svelte';
	import {fade, fly} from 'svelte/transition';
	import {evmGame} from '$lib/state/computed';

	interface Props {
		gameView: GameView;
	}

	let {gameView}: Props = $props();
	let characterClass = $derived($intro.character?.classIndex || 0);
	let classPortrait = $derived(portrait(characterClass));
	// let characterClassName = $derived(characterClass === 0 ? 'Barbarian' : 'Unknown');

	// let xp = $derived($gameView && $gameView.currentCharacter ? $gameView.currentCharacter.xp : 0);
	let hp = $derived($gameView && $gameView.currentCharacter ? $gameView.currentCharacter.hp : 0);

	const offchainState = accountState.offchainState;

	let myAttackCards = $derived($battleState!.character.attackCards);
	let myDefenseCards = $derived($battleState!.character.defenseCards);
	let monsterAttackCards = $derived($battleState!.monster.attackCards);
	let monsterDefenseCards = $derived($battleState!.monster.defenseCards);
	let monsterSelectedAttackCard = $derived($battleState!.monster.currentAttackCardIndex);
	let monsterSelectedDefenseCard = $derived($battleState!.monster.currentDefenseCardIndex);
	let monsterHP = $derived($battleState!.monster.hp);
	let monsterInitialHP = $derived($battleState!.monster.initialHP);

	let result: {monsterHPLoss: number; heroHPLoss: number} | undefined = $state();
	let hero_attack_success = $derived(result && result.monsterHPLoss > 0);
	let hero_attack_failure = $derived(result && result.monsterHPLoss == 0);
	let monster_attack_success = $derived(result && result.heroHPLoss > 0);
	let monster_attack_failure = $derived(result && result.heroHPLoss == 0);
	let hero_defense_success = $derived(result && result.heroHPLoss == 0);
	let hero_defense_failure = $derived(result && result.heroHPLoss > 0);
	let monster_defense_success = $derived(result && result.monsterHPLoss == 0);
	let monster_defense_failure = $derived(result && result.monsterHPLoss > 0);

	async function confirmBattleChoice(attackCardIndex: number, defenseCardIndex: number) {
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

		const heroBefore = {hp: currentStateChanges.newHP};
		const heroAfter = {hp: stateChanges.newHP};
		const monsterIndex = currentStateChanges.battle.monsterIndexPlus1 - 1;
		const monsterBefore = currentStateChanges.monsters[monsterIndex];
		const monsterAfter = stateChanges.monsters[monsterIndex];

		result = {
			monsterHPLoss: 0,
			heroHPLoss: 0,
		};
		if (monsterAfter.hp < monsterBefore.hp || stateChanges.battle.monsterIndexPlus1 == 0) {
			// play animation
			result.monsterHPLoss = monsterBefore.hp - monsterAfter.hp;
		}

		if (heroAfter.hp < heroBefore.hp) {
			// play animation
			result.monsterHPLoss = heroBefore.hp - heroAfter.hp;
		}

		setTimeout(() => {
			accountState.addMove(
				gameView.$state.stage,
				{
					type: 'battle',
					attackCardIndex,
					defenseCardIndex,
				},
				stateChanges,
			);

			setTimeout(() => {
				result = undefined;
				// TODO if dead, show result battle
				if (stateChanges.battle.monsterIndexPlus1 == 0) {
					accountState.acceptEnd();
				}
			}, 700);
		}, 250);
	}
</script>

<div class="wrapper">
	<div class="centered">
		<BorderedContainer>Ready to fight! Select both an attack and defense card.</BorderedContainer>
	</div>
	<div class="centered">
		<p>Skeleton</p>
		<div class="bar"><HpBar value={monsterHP} maxValue={monsterInitialHP} /></div>
	</div>
	<div class="monster">
		<div class="monster-cards">
			{#if $offchainState.inBattle?.cards.choicePresented}
				<div class="selection" transition:fly={{y: -100}}>
					<div transition:fade>
						{#if $offchainState.inBattle?.cards.choicePresented === 'attack'}
							<BattleCardChoice position="top" cards={monsterDefenseCards} selected={monsterSelectedDefenseCard} />
						{:else}
							<BattleCardChoice position="top" cards={monsterAttackCards} selected={monsterSelectedAttackCard} />
						{/if}
					</div>
				</div>
			{/if}
			<div class="enemy-selection">
				<div class:monster_defense_failure class:monster_defense_success>
					<Card position="top" card={monsterDefenseCards[monsterSelectedDefenseCard]} />
				</div>

				<div class:monster_attack_failure class:monster_attack_success>
					<Card position="top" card={monsterAttackCards[monsterSelectedAttackCard]} />
				</div>
			</div>
		</div>

		<div class="monster-image">
			<img alt="skeleton" src="/images/monsters/skeleton.png" />
		</div>

		{#if !result && $offchainState.inBattle?.cards.attackChosen && $offchainState.inBattle?.cards.defenseChosen}
			<button
				onclick={() =>
					confirmBattleChoice(
						$offchainState.inBattle!.cards.attackChosen!.cardIndex,
						$offchainState.inBattle!.cards.defenseChosen!.cardIndex,
					)}
				class="confirm">confirm</button
			>
		{/if}
	</div>

	<div
		class="actions"
		class:chosen={$offchainState.inBattle?.cards.attackChosen && $offchainState.inBattle?.cards.defenseChosen}
	>
		{#if $offchainState.inBattle?.cards.choicePresented}
			<div class="selection player-selection" transition:fly={{y: 100}}>
				<div transition:fade>
					{#if $offchainState.inBattle?.cards.choicePresented === 'attack'}
						<BattleCardChoice
							position="bottom"
							cards={myAttackCards}
							onselected={(_card, i) => {
								accountState.selectAttackCard(i);
							}}
						/>
					{:else}
						<BattleCardChoice
							position="bottom"
							cards={myDefenseCards}
							onselected={(_card, i) => {
								accountState.selectDefenseCard(i);
							}}
						/>
					{/if}
				</div>
			</div>
		{/if}

		{#if !$offchainState.inBattle?.cards.attackChosen}
			<button onclick={() => accountState.showChoice('attack')} class="button-action btn-animate-1"
				>select attack</button
			>
			<!-- <div class="player-choice">
			<BattleCardChoice onselected={cardSelected} cards={myCards} selected={mySelection} />
		</div> -->
		{:else}
			<div class:hero_attack_success class:hero_attack_failure>
				<Card
					position="bottom"
					onclick={() => accountState.showChoice('attack')}
					card={myAttackCards[$offchainState.inBattle?.cards.attackChosen.cardIndex]}
				/>
			</div>
		{/if}
		{#if !$offchainState.inBattle?.cards.defenseChosen}
			<button onclick={() => accountState.showChoice('defense')} class="button-action btn-animate-2"
				>select defense</button
			>
			<!-- <div class="player-choice">
			<BattleCardChoice onselected={cardSelected} cards={myCards} selected={mySelection} />
		</div> -->
		{:else}
			<div class:hero_defense_success class:hero_defense_failure>
				<Card
					position="bottom"
					onclick={() => accountState.showChoice('defense')}
					card={myDefenseCards[$offchainState.inBattle?.cards.defenseChosen.cardIndex]}
				/>
			</div>
		{/if}
	</div>

	<div class="hero">
		<div class="icon">
			<img src={classPortrait} alt="profile" />
		</div>
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

	.hero_attack_success {
		transition: transform 250ms;
		transform: translateY(-100px);
	}

	.hero_attack_failure {
		transition: opacity 250ms;
		opacity: 0.4;
	}

	.monster_attack_success {
		transition: transform 250ms;
		transform: translateY(100px);
	}

	.monster_attack_failure {
		transition: opacity 250ms;
		opacity: 0.4;
	}

	.hero_defense_failure {
		transition: opacity 250ms;
		opacity: 0.4;
	}

	.monster_defense_failure {
		transition: opacity 250ms;
		opacity: 0.4;
	}

	.enemy-selection {
		display: flex;
		gap: 2.5rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.monster_defense_success :global(button) {
		border-color: green;
	}
	.hero_defense_success :global(button) {
		border-color: green;
	}
	.monster_attack_success :global(button) {
		border-color: green;
	}
	.hero_attack_success :global(button) {
		border-color: green;
	}

	.monster_defense_failure :global(button) {
		border-color: red;
	}
	.hero_defense_failure :global(button) {
		border-color: red;
	}
	.monster_attack_failure :global(button) {
		border-color: red;
	}
	.hero_attack_failure :global(button) {
		border-color: red;
	}

	.selection {
		padding: 2rem;
		width: 100%;
		background-color: #191919;
		position: absolute;
		z-index: 3;
	}

	.player-selection {
		margin-top: -80px;
	}

	.monster-cards {
		z-index: 1;
		width: 100%;
		position: relative;
	}

	.button-action {
		border: solid white 2px;
		background-color: unset;
		color: white;
		width: 100px;
	}

	.btn-animate-1 {
		animation: border-pulsate 2s 0.4s ease-in-out infinite;
	}
	.btn-animate-2 {
		animation: border-pulsate 2s 0s ease-in-out infinite;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.actions.chosen {
		gap: 2.5rem;
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

	.monster {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.confirm {
		width: 100px;
		margin-top: -24px;
		margin-bottom: 12px;
		z-index: 4;
	}

	.monster-image {
		display: flex;
		justify-content: center;
		/* background-color: red; */
	}

	.monster img {
		width: 300px;
		min-width: 128px;
		aspect-ratio: 1;
		image-rendering: pixelated;
		filter: sepia() hue-rotate(50deg) brightness(80%);
		/* opacity: 0.7; */
	}

	.hero {
		margin-top: 10px;
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
