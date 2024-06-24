<script>
	import {welcomeBack} from '$lib/data/texts';
	import {connection, introductionState, playerStatus} from '$lib/state';
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
		btn={[{text: 'Start A New Adventure', func: startIntroduction}]}
		text="Welcome!"
	></DefaultScreen>
{:else if $playerStatus === 'in-game-already'}
	<DefaultScreen
		header="logo"
		footer="social"
		btn={[{text: 'Continue', func: startIntroduction}]}
		text={welcomeBack($connection)}
		subtext="You are already in the Catacombs. Come explore more..."
		signOut={true}
	></DefaultScreen>
{:else if $playerStatus === 'first-time'}
	<DefaultScreen
		header="logo"
		footer="social"
		btn={[{text: 'Start A New Adventure', func: startIntroduction}]}
		text={welcomeBack($connection)}
		subtext="You have yet to create a character and discover the Catacombs!"
		signOut={true}
	></DefaultScreen>
{:else}
	Invalid playerStatus: {$playerStatus}
{/if}
