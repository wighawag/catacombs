<script lang="ts">
	import DefaultScreen from '../DefaultScreen.svelte';
	import SelectCharacterClass from '$lib/ui/components/SelectCharacterClass.svelte';
	import {characterClassInfo} from '$lib/data/characters';
	import {intro} from '$lib/state/intro';

	interface Props {
		next: () => void;
	}

	let {next}: Props = $props();

	let name: string = $state('');
	let characterClassIndex = $state(0);
	let classInfo = $derived(characterClassInfo(characterClassIndex));

	$effect(() => {
		console.log({classInfo});
	});
</script>

<DefaultScreen
	header="logo"
	btn={[
		{
			text: 'Go forth',
			func: async () => {
				if (name && name !== '') {
					intro.selectCharacter(name, characterClassIndex);
					next();
				}
			},
			disabled: !(name && name !== ''),
		},
	]}
>
	<SelectCharacterClass bind:characterClassIndex bind:name />
</DefaultScreen>
