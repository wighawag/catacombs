<script lang="ts">
	import {performAction} from '$lib/actions/ActionHandler';
	import {context} from '$lib/state';
	import {type GameView} from '$lib/state/ViewState';
	import BattleOverlay from '$lib/ui/screens/game/BattleOverlay.svelte';
	import PaymentDialogOverlay from '$lib/ui/screens/intro/PaymentDialogOverlay.svelte';
	import TutorialDialogOverlay from '$lib/ui/screens/intro/TutorialDialogOverlay.svelte';
	export let gameView: GameView;

	function move(direction: {dx: number; dy: number}) {
		performAction(gameView, direction);
	}

	$: console.log({inBattle: $gameView.inBattle});
</script>

{#if !$gameView.inBattle && $gameView.currentCharacter && $gameView.currentCharacter.position.x == 0 && $gameView.currentCharacter.position.y == 0}
	{#if $gameView.offchainState?.tutorialStep == 3}
		<PaymentDialogOverlay {gameView} />
	{:else}
		<TutorialDialogOverlay {gameView}>
			{#if $gameView.offchainState?.tutorialStep == 1}As you approach the imposing gate of Ethernal, an unexpected sight
				catches your eye. A lone merchant has set up shop in this unlikely place, their stall laden with various
				foodstuffs.
			{:else if $gameView.offchainState?.tutorialStep == 2}
				The rumbling in your stomach suddenly reminds you that it's been days since your last proper meal. A wave of
				relief washes over you - this is your final opportunity to stock up before venturing into the unknown depths of
				the ancient city.
			{/if}
		</TutorialDialogOverlay>
	{/if}
{:else if $context.context === 'start' && (!$gameView.offchainState || $gameView.offchainState?.tutorialStep == 0)}
	<TutorialDialogOverlay {gameView}
		>At last, Ethernal's fabled entrance. This magical portal whose light help us see is my doorway to the catacombs and
		all the secrets they hold. I've come this far now it's time to step into the unknown and unravel the mysteries of
		this ancient underground realm.</TutorialDialogOverlay
	>
{:else if $gameView.inBattle || ($gameView.offchainState?.inBattle?.accepted && !$gameView.offchainState?.inBattle?.endAccepted)}
	<BattleOverlay {gameView} />
{:else}
	<div class="navigation">
		<div class="north"><button on:click={() => move({dx: 0, dy: -1})}>N</button></div>
		<div class="west-south-east">
			<button on:click={() => move({dx: -1, dy: 0})}>W</button>
			<button on:click={() => move({dx: 0, dy: +1})}>S</button>
			<button on:click={() => move({dx: +1, dy: 0})}>E</button>
		</div>
	</div>
{/if}

<style>
	.navigation {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-content: flex-start;
		position: absolute;
		bottom: 0;
		right: 0;
		width: 14rem;
	}
	.north {
		display: flex;
		justify-content: center;
		flex-basis: 100%;
		gap: 1rem;
	}
	.west-south-east {
		display: flex;
		justify-content: center;
		flex-basis: 100%;
		gap: 1rem;
	}
	button {
		width: 4rem;
		height: 4rem;
		background-color: black;
		opacity: 0.65;
		border: 2px solid white;
		color: white;
	}
</style>
