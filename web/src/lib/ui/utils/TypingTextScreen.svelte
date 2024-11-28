<script lang="ts">
	import type {SvelteComponent} from 'svelte';
	import DefaultScreen from '../screens/DefaultScreen.svelte';
	import TypeWriterSingleText from './TypeWriterSingleText.svelte';

	interface Props {
		text: string;
		next: () => Promise<void>;
		buttonText?: string;
		waitText?: string;
		disableSkip?: boolean;
	}

	let {text, next, buttonText = 'Continue on...', waitText = 'Please wait...', disableSkip = false}: Props = $props();

	let writing = $state(true);
	let waiting = $state(false);

	let btnText = $derived(buttonText);
	let btnDisabled = $derived(writing);

	const btnPressed = async () => {
		waiting = true;
		await next();
		waiting = false;
	};

	// svelte-ignore non_reactive_update
	let writer: SvelteComponent;
	let progress: number = $state(0);
	let timeLeft: number = $state(1000000000);

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
