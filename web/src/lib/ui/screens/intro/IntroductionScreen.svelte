<script lang="ts">
	import TypingTextScreen from '$lib/ui/utils/TypingTextScreen.svelte';
	import DefaultScreen from '../DefaultScreen.svelte';

	let step = 0;
</script>

{#if step == 0}
	<DefaultScreen
		header="logo"
		signIn={true}
		footer="social"
		btnText="Start A New Adventure"
		btnPressed={async () => {
			step++;
		}}
		text="Welcome!"
		btnDisabled={false}>Welcome to Catacombs</DefaultScreen
	>
{:else}
	<TypingTextScreen
		buttonText="Pay 12. for food"
		disableSkip={true}
		waitText="The elemental counts your money while you check the food...."
		text="An elemental appears: “You need food to survive in the dungeon. Remember, in the Ethernal every action
      will cost you food.”"
		next={async () => {
			console.log('done');
		}}
	/>
{/if}
