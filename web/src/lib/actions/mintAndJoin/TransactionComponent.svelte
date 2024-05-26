<script lang="ts">
	import type {Writable} from 'svelte/store';
	import type {MintAndJoinState} from '.';
	import {JsonView} from '@zerodevx/svelte-json-view';
	import {serializeJSONWithBigInt} from '$utils/js';
	import {formatEther} from 'viem';

	export let state: Writable<MintAndJoinState>;

	$: value = $state.transaction?.value;
	$: formatedValue = value ? formatEther(value) : undefined;
</script>

<div class="form">
	<p>
		This Transaction will Commit Your Moves. You can cancel (or Replace it with new Moves) before the Resolution Phase
		Start.
	</p>

	{#if formatedValue}
		<p>
			The transaction is also sending {formatedValue} ETH so we can reveal on your behalf. This is a worst-case estimate
			and unspend value can be used for further tx.
		</p>
	{/if}
</div>

<style>
	p {
		margin-bottom: 1rem;
	}
</style>
