<script lang="ts">
	import TypingTextScreen from '$lib/ui/utils/TypingTextScreen.svelte';
	import DefaultScreen from '../DefaultScreen.svelte';
	import CharacterSelectionScreen from './CharacterSelectionScreen.svelte';
	import {context, introductionState, playerStatus} from '$lib/state';
	import LoadingScreen from '../loading/LoadingScreen.svelte';
	import {welcomeBack} from '$lib/data/texts';
	import {connection} from '$lib/state/connection';
	import MainGameScreen from '../game/MainGameScreen.svelte';
	import {gameView} from '$lib/state/ViewState';

	async function next() {
		introductionState.next();
	}

	async function back(step?: number) {
		introductionState.back(step);
	}

	function mint() {
		console.log('minting...');
		return new Promise<void>((resolve) => {
			setTimeout(resolve, 500);
		}).then(() => {
			introductionState.clear();
			context.gotoGameScreen();
		});
	}

	async function signin(): Promise<void> {
		try {
			await connection.loginWithEmail();
			next();
		} catch (err) {
			console.error(err);
		}
	}

	async function gotoGameScreen(): Promise<void> {
		introductionState.clear();
		context.gotoGameScreen();
	}

	const texts = [
		'The campfire crackles softly as you pore over the ancient map one last time. Your fingers trace the faded lines leading to a crudely drawn mountain, below which lies your ultimate goal: Ethernal, the fabled underground city.',
		'Dawn breaks, and you think, "It\'s time." Rising, you stride towards the mountain\'s gaping maw, steeling yourself for the descent into the narrow, winding passage that beckons.',
		'So close now. Images of shimmering relics and reality-bending magic fill your mind, countered by visions of lethal traps and unspeakable monstrosities. You clutch your weapon tighter.',
	];

	const continueText = 'Continue where you left';
	const prepareText =
		"Now's the moment to take inventory. What gear did you pack for this perilous expedition? Carefully check your supplies and equipment. Is there anything crucial you might have overlooked?";
</script>

{#if $playerStatus == 'loading'}
	<LoadingScreen />
{:else if $playerStatus == 'catchingup'}
	<LoadingScreen />
{:else if $introductionState.step == 1}
	<CharacterSelectionScreen {next}></CharacterSelectionScreen>
{:else if $introductionState.step >= 2 && $introductionState.step < texts.length + 2}
	{#key $introductionState.step}
		<TypingTextScreen buttonText="Continue" text={texts[$introductionState.step - 2]} {next} />
	{/key}
{:else if $introductionState.step == 2 + texts.length + 0}
	{#if $playerStatus == 'unconnected'}
		<TypingTextScreen waitText="Checking your equipments..." buttonText="Sign-in" text={prepareText} next={signin} />
	{:else if $playerStatus == 'in-game-already'}
		<DefaultScreen
			header="profile"
			btn={[{text: 'continue', func: gotoGameScreen}]}
			text={welcomeBack($connection)}
			subtext={continueText}
			signOut={true}
		/>
	{:else if $playerStatus == 'first-time'}
		<TypingTextScreen buttonText="continue" text={`You check your gears one last time. All in order.`} {next} />
	{:else}
		Invalid playerStatus: {$playerStatus}
	{/if}
{:else if $introductionState.step == 2 + texts.length + 1}
	{#if $playerStatus == 'unconnected'}
		<TypingTextScreen buttonText="go back" text="Wait, you need to be logged-in to continue" next={() => back(5)} />
	{:else if $playerStatus == 'in-game-already'}
		<DefaultScreen
			header="profile"
			btn={[{text: 'continue', func: gotoGameScreen}]}
			text={welcomeBack($connection)}
			subtext={continueText}
			signOut={true}
		/>
	{:else if $playerStatus == 'first-time'}
		<TypingTextScreen
			buttonText="continue"
			text={"The claustrophobic tunnel suddenly opens into an enormous cavern. Your flickering torch barely pierces the thick darkness. Ahead, an unearthly radiance outlines what must be Ethernal's gate!"}
			{next}
		/>
	{:else}
		Invalid playerStatus: {$playerStatus}
	{/if}
{:else if $introductionState.step == 2 + texts.length + 2}
	{#if $playerStatus == 'unconnected'}
		<TypingTextScreen buttonText="go back" text="Wait, you need to be logged-in to continue" next={() => back(5)} />
	{:else if $playerStatus == 'in-game-already'}
		<DefaultScreen
			header="profile"
			btn={[{text: 'continue', func: gotoGameScreen}]}
			text={welcomeBack($connection)}
			subtext={continueText}
			signOut={true}
		/>
	{:else if $playerStatus == 'first-time'}
		<MainGameScreen {gameView} />
	{:else}
		Invalid playerStatus: {$playerStatus}
	{/if}
{:else if $introductionState.step == 2 + texts.length + 3}
	{#if $playerStatus == 'unconnected'}
		<TypingTextScreen buttonText="go back" text="Wait, you need to be logged-in to continue" next={() => back(5)} />
	{:else if $playerStatus == 'in-game-already'}
		<DefaultScreen
			header="profile"
			btn={[{text: 'continue', func: gotoGameScreen}]}
			text={welcomeBack($connection)}
			subtext={continueText}
			signOut={true}
		/>
	{:else if $playerStatus == 'first-time'}
		<TypingTextScreen
			buttonText="Pay for food"
			waitText="The merchant counts your money while you check the food...."
			text="As you approach the imposing gate of Ethernal, an unexpected sight catches your eye. A lone merchant has set up shop in this unlikely place, their stall laden with various foodstuffs. The rumbling in your stomach suddenly reminds you that it's been days since your last proper meal. A wave of relief washes over you – this is your final opportunity to stock up before venturing into the unknown depths of the ancient city."
			next={mint}
		/>
	{:else}
		Invalid playerStatus: {$playerStatus}
	{/if}
{/if}
