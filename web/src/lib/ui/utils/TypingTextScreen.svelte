<script lang="ts">
	import type {SvelteComponent} from 'svelte';
	import DefaultScreen from '../screens/DefaultScreen.svelte';
	import TypeWriterSingleText from './TypeWriterSingleText.svelte';

	export let text: string;
	export let next: () => Promise<void>;
	export let buttonText = 'Continue on...';
	export let waitText = 'Please wait...';
	export let disableSkip: boolean = false;

	let writing = true;
	let waiting = false;

	$: btnText = buttonText;
	$: btnDisabled = writing;

	const btnPressed = async () => {
		waiting = true;
		await next();
		waiting = false;
	};

	let writer: SvelteComponent;
	let progress: number;
	let timeLeft: number;

	function skipText() {
		if (timeLeft > 400) {
			writer.skip();
		}
	}
</script>

<DefaultScreen
	header="profile"
	btn={[
		{text: btnText, func: btnPressed, disabled: btnDisabled},
		{text: 'skip', func: skipText, disabled: disableSkip},
	]}
>
	{#if waiting}
		{waitText}
	{:else}
		<TypeWriterSingleText
			{text}
			charTime={34}
			on:done={() => {
				writing = false;
			}}
			bind:this={writer}
			bind:progress
			bind:timeLeft
		/>
	{/if}
</DefaultScreen>
