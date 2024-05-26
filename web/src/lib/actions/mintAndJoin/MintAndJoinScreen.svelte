<script>
	import FullScreenModal from '$lib/ui/FullScreenModal.svelte';
	import {start} from '.';

	async function mintAndJoin() {
		await start();
	}
</script>

<FullScreenModal>
	<button on:click={mintAndJoin}>Enter</button>
</FullScreenModal>
