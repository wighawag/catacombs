<script>
	import {playerStatus} from '$lib/state';
	import DefaultScreen from '../DefaultScreen.svelte';
	import LoadingScreen from '../loading/LoadingScreen.svelte';

	function signIn() {}

	function goToIntro() {}
</script>

{#if $playerStatus == 'loading'}
	<LoadingScreen />
{:else if $playerStatus == 'catchingup'}
	<LoadingScreen />
{:else if $playerStatus == 'unconnected'}
	<DefaultScreen header="profile" btnText="Sign-in" text="Please login" btnPressed={signIn} />
{:else if $playerStatus == 'in-game-already'}
	Game
{:else if $playerStatus == 'first-time'}
	<DefaultScreen header="logo" btnText="ok" text="Welcome" btnPressed={goToIntro} />
{:else}
	Invalid playerStatus: {$playerStatus}
{/if}
