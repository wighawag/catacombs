<script lang="ts">
	import DefaultScreen from '../DefaultScreen.svelte';
	import SelectCharacterClass from '$lib/ui/components/SelectCharacterClass.svelte';
	import {characterClassInfo} from '$lib/data/characters';

	export let next;

	let name: string;
	let characterClassIndex = 0;
	$: classInfo = characterClassInfo(characterClassIndex);

	$: console.log({classInfo});
</script>

<DefaultScreen
	header="logo"
	btnText="Go forth"
	btnPressed={async () => {
		if (name && name !== '') {
			//characterChoice.setData({name, characterClass});
			next();
		}
	}}
	btnDisabled={!(name && name !== '')}
>
	<SelectCharacterClass bind:characterClassIndex bind:name />
</DefaultScreen>
