<script>
	import {playerStatus} from '$lib/state';
	import {gameView} from '$lib/state/ViewState';
	import DefaultScreen from '../DefaultScreen.svelte';
	import LoadingScreen from '../loading/LoadingScreen.svelte';
	import MainGameScreen from './MainGameScreen.svelte';

	function signIn() {}

	function goToIntro() {}
</script>

{#if $playerStatus == 'loading'}
	<LoadingScreen />
{:else if $playerStatus == 'catchingup'}
	<LoadingScreen />
{:else if $playerStatus == 'unconnected'}
	<DefaultScreen header="profile" btn={[{text: 'Sign-in', func: signIn}]} text="Please login" />
{:else if $playerStatus == 'in-game-already'}
	<MainGameScreen {gameView} />
{:else if $playerStatus == 'first-time'}
	<MainGameScreen {gameView} />
	<!-- TODO deal with this case. for now use GameScreen-->
	<!-- <DefaultScreen header="logo" btn={[{text: 'ok', func: goToIntro}]} text="Welcome" /> -->
{:else}
	Invalid playerStatus: {$playerStatus}
{/if}
