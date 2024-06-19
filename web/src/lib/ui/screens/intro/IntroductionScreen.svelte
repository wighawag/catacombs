<script lang="ts">
	import TypingTextScreen from '$lib/ui/utils/TypingTextScreen.svelte';
	import DefaultScreen from '../DefaultScreen.svelte';
	import CharacterSelectionScreen from './CharacterSelectionScreen.svelte';
	import {connection, introductionState, playerStatus} from '$lib/state';
	import LoadingScreen from '../loading/LoadingScreen.svelte';

	async function next() {
		introductionState.next();
	}

	async function back() {
		introductionState.back();
	}

	function mint() {
		console.log('minting...');
		return new Promise<void>((resolve) => {
			setTimeout(resolve, 500);
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

	async function gotoGameScreen(): Promise<void> {}
</script>

{#if $introductionState.step == 0}
	<DefaultScreen
		header="logo"
		signIn={true}
		footer="social"
		btnText="Start A New Adventure"
		btnPressed={next}
		text="Welcome!"
		btnDisabled={false}
	></DefaultScreen>
{:else if $introductionState.step == 1}
	<CharacterSelectionScreen {next}></CharacterSelectionScreen>
{:else if $introductionState.step == 2}
	<!-- TODO title THE ARRIVAL-->
	<TypingTextScreen
		buttonText="Continue"
		disableSkip={true}
		text="You are carefully pacing down a darkened path. Gloom had set in hours before. You knew the stories about this
		place you are heading: there is untold wealth in that labyrinth, leftover from a forgotten civilization. There is
		also damnation..."
		{next}
	/>
{:else if $introductionState.step == 3}
	<TypingTextScreen
		buttonText="Continue"
		disableSkip={true}
		text="Well, sounds like a bunch of scary stories to keep people away."
		{next}
	/>
{:else if $introductionState.step == 4}
	<!-- TODO title THE ENTRANCE-->
	<TypingTextScreen
		buttonText="Continue"
		disableSkip={true}
		text="There’s a reason they have stayed away, but the reason you’ve come is stronger still. Get as much loot as you
		can, and then get out. And if you encounter others like yourself, earn some cash by selling them your loot. Or, they
		will even fight with you. Your anticipation grows..."
		{next}
	/>
{:else if $introductionState.step == 5}
	{#if $playerStatus == 'loading'}
		<LoadingScreen />
	{:else if $playerStatus == 'catchingup'}
		<LoadingScreen />
	{:else if $playerStatus == 'unconnected'}
		<TypingTextScreen
			buttonText="Sign-in"
			disableSkip={true}
			text="But before, let's make sure you are prepared. Get your gears and coins before setting off for the unknown..."
			next={signin}
		/>
	{:else if $playerStatus == 'in-game-already'}
		<DefaultScreen
			header="profile"
			btnText="continue"
			text="Welcome back"
			subtext="Continue where you left"
			btnPressed={gotoGameScreen}
			signOut={true}
		/>
	{:else if $playerStatus == 'first-time'}
		<TypingTextScreen
			buttonText="continue"
			disableSkip={true}
			text={`I see that you already start prepared ${$connection.address}`}
			{next}
		/>
	{:else}
		Invalid playerStatus: {$playerStatus}
	{/if}
{:else if $introductionState.step == 6}
	{#if $playerStatus == 'loading'}
		<LoadingScreen />
	{:else if $playerStatus == 'catchingup'}
		<LoadingScreen />
	{:else if $playerStatus == 'unconnected'}
		<TypingTextScreen
			buttonText="go back"
			disableSkip={true}
			text="Wait, you need to be logged-in to continue"
			next={back}
		/>
	{:else if $playerStatus == 'in-game-already'}
		<DefaultScreen
			header="profile"
			btnText="continue"
			text="Welcome back"
			subtext="Continue where you left"
			btnPressed={gotoGameScreen}
			signOut={true}
		/>
	{:else if $playerStatus == 'first-time'}
		<TypingTextScreen
			buttonText="Pay for food"
			disableSkip={true}
			waitText="The elemental counts your money while you check the food...."
			text="An elemental appears: “You need food to survive in the dungeon. Remember, in the Ethernal every day
  will cost you food.”"
			next={mint}
		/>
	{:else}
		Invalid playerStatus: {$playerStatus}
	{/if}
{/if}
