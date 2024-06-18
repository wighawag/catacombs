<script lang="ts">
	import type {Writable} from 'svelte/store';
	import type {MintAndJoinState} from '.';

	export let state: Writable<MintAndJoinState>;
</script>

<div class="form">
	{$state.error}
</div>

<style>
	p {
		margin-bottom: 1rem;
	}
</style>
