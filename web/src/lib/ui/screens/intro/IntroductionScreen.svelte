<script lang="ts">
	import TypingTextScreen from '$lib/ui/utils/TypingTextScreen.svelte';
	import DefaultScreen from '../DefaultScreen.svelte';
	import {page} from '$app/stores';
	import {goto} from '$app/navigation';
	import CharacterSelectionScreen from './CharacterSelectionScreen.svelte';
	import {connection} from '$lib/state';

	$: step = Number($page.url.hash ? $page.url.hash.slice('#introduction_'.length) || 0 : 0);

	$: console.log({step});

	async function next() {
		const url = new URL($page.url);
		url.hash = `#introduction_${step + 1}`;
		goto(url);
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

{#if step == 0}
	<DefaultScreen
		header="logo"
		signIn={true}
		footer="social"
		btnText="Start A New Adventure"
		btnPressed={next}
		text="Welcome!"
		btnDisabled={false}
	></DefaultScreen>
{:else if step == 1}
	<CharacterSelectionScreen {next}></CharacterSelectionScreen>
{:else if step == 2}
	<!-- TODO title THE ARRIVAL-->
	<TypingTextScreen
		buttonText="Continue"
		disableSkip={true}
		text="You are carefully pacing down a darkened path. Gloom had set in hours before. You knew the stories about this
		place you are heading: there is untold wealth in that labyrinth, leftover from a forgotten civilization. There is
		also damnation..."
		{next}
	/>
{:else if step == 3}
	<TypingTextScreen
		buttonText="Continue"
		disableSkip={true}
		text="Well, sounds like a bunch of scary stories to keep people away."
		{next}
	/>
{:else if step == 4}
	<!-- TODO title THE ENTRANCE-->
	<TypingTextScreen
		buttonText="Continue"
		disableSkip={true}
		text="There’s a reason they have stayed away, but the reason you’ve come is stronger still. Get as much loot as you
		can, and then get out. And if you encounter others like yourself, earn some cash by selling them your loot. Or, they
		will even fight with you. Your anticipation grows..."
		{next}
	/>
{:else if step == 5}
	<TypingTextScreen
		buttonText="Sign-in"
		disableSkip={true}
		text="But before, let's make sure you are prepared. Get your gears and coins before setting off for the unknown..."
		next={signin}
	/>
{:else if step == 6}
	<!-- AUTO STEP-->
	{#if true}
		<!-- $state.inDungeon -->
		<DefaultScreen btnDisabled={false} header="profile" btnText="onward!" btnPressed={gotoGameScreen}
			><h1>Welcome back!</h1>
			<p>We found your character in the dungeon. Please proceed.</p></DefaultScreen
		>
	{:else}
		<TypingTextScreen
			buttonText="Sign-in"
			disableSkip={true}
			text="But before, let's make sure you are prepared. Get your gears and coins before setting off for the unknown..."
			next={signin}
		/>
	{/if}
{:else if step == 7}
	<TypingTextScreen
		buttonText="Pay for food"
		disableSkip={true}
		waitText="The elemental counts your money while you check the food...."
		text="An elemental appears: “You need food to survive in the dungeon. Remember, in the Ethernal every day
      will cost you food.”"
		next={mint}
	/>
{/if}
