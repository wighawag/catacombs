<script>
	import {introductionState, playerStatus} from '$lib/state';
	import DefaultScreen from './DefaultScreen.svelte';
	export function startIntroduction() {
		introductionState.next();
	}
</script>

{#if $playerStatus === 'loading'}
	Loading...
{:else if $playerStatus === 'catchingup'}
	Downloading the latest State...
{:else if $playerStatus === 'unconnected'}
	<DefaultScreen
		header="logo"
		signIn={true}
		footer="social"
		btnText="Start A New Adventure"
		btnPressed={startIntroduction}
		text="Welcome!"
		btnDisabled={false}
	></DefaultScreen>
{:else if $playerStatus === 'in-game-already'}
	<DefaultScreen
		header="logo"
		footer="social"
		btnText="Continue"
		btnPressed={startIntroduction}
		text="Welcome back!"
		subtext="You are already in the Catacombs. Come explore more..."
		btnDisabled={false}
		signOut={true}
	></DefaultScreen>
{:else if $playerStatus === 'first-time'}
	<DefaultScreen
		header="logo"
		footer="social"
		btnText="Start A New Adventure"
		btnPressed={startIntroduction}
		text="Welcome back!"
		subtext="You have yet to create a character and discover the Catacombs!"
		btnDisabled={false}
		signOut={true}
	></DefaultScreen>
{:else}
	Invalid playerStatus: {$playerStatus}
{/if}
