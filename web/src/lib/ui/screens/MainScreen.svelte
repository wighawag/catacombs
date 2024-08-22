<script lang="ts">
	import IntroductionScreen from './intro/IntroductionScreen.svelte';
	import {context, introductionState, playerStatus} from '$lib/state';
	import StartScreen from './StartScreen.svelte';
	import LoadingScreen from './loading/LoadingScreen.svelte';
	import GameScreen from './game/GameScreen.svelte';
	import Flow from '$lib/actions/flow/Flow.svelte';
</script>

{#if $context.context === 'loading'}
	<LoadingScreen />
{:else if $context.context === 'start'}
	{#if $introductionState.step > 0}
		<IntroductionScreen />
	{:else}
		<StartScreen />
	{/if}
{:else if $context.context === 'game'}
	<GameScreen />
{:else}
	Invalid {$playerStatus}
{/if}

<Flow />
