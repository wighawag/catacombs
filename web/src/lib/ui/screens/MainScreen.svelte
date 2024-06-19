<script lang="ts">
	import IntroductionScreen from './intro/IntroductionScreen.svelte';
	import {context, playerStatus} from '$lib/state';
</script>

{#if $context.context === 'loading'}
	Loading {$playerStatus}
{:else if $context.context === 'introduction'}
	<IntroductionScreen />
{:else if $context.context === 'game'}
	Game {$playerStatus}
{:else}
	Invalid {$playerStatus}
{/if}
