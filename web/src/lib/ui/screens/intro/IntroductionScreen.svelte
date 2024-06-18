<script lang="ts">
	import TypingTextScreen from '$lib/ui/utils/TypingTextScreen.svelte';
	import DefaultScreen from '../DefaultScreen.svelte';
	import {page} from '$app/stores';
	import {goto} from '$app/navigation';
	import CharacterSelectionScreen from './CharacterSelectionScreen.svelte';

	$: step = Number($page.url.hash ? $page.url.hash.slice('#introduction_'.length) || 0 : 0);

	$: console.log({step});

	async function next() {
		const url = new URL($page.url);
		url.hash = `#introduction_${step + 1}`;
		goto(url);
	}

	async function mint() {
		console.log('minting...');
	}
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
	<TypingTextScreen
		buttonText="Pay for food"
		disableSkip={true}
		waitText="The elemental counts your money while you check the food...."
		text="An elemental appears: “You need food to survive in the dungeon. Remember, in the Ethernal every action
      will cost you food.”"
		next={mint}
	/>
{/if}
