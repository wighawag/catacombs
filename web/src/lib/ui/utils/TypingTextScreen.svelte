<script lang="ts">
	import DefaultScreen from '../screens/DefaultScreen.svelte';
	import TypeWriterSingleText from './TypeWriterSingleText.svelte';

	export let text: string;
	export let next: () => Promise<void>;
	export let buttonText = 'Continue on...';
	export let waitText = 'Please wait...';
	export let disableSkip: boolean;

	let writing = true;
	let waiting = false;

	$: btnText = !disableSkip && writing ? 'Skip' : buttonText;
	$: btnDisabled = disableSkip && writing;

	const btnPressed = async () => {
		waiting = true;
		await next();
		waiting = false;
	};
</script>

<DefaultScreen header="profile" {btnText} {btnDisabled} {btnPressed}>
	{#if waiting}
		{waitText}
	{:else}
		<TypeWriterSingleText
			{text}
			charTime={34}
			on:done={() => {
				writing = false;
			}}
		/>
	{/if}
</DefaultScreen>
