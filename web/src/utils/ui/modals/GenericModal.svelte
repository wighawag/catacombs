<script lang="ts">
	import Modal from './Modal.svelte';
	import {genericModals, type GenericModalData} from './generic-modals.js';
	import type {Cancellation} from './types';

	interface Props {
		oncancel?: Cancellation | undefined;
		modal: GenericModalData;
	}

	let { oncancel = undefined, modal }: Props = $props();
	let info = $derived(modal.type === 'info' ? modal : undefined);
	let confirm = $derived(modal.type === 'confirm' ? modal : undefined);
</script>

<Modal {oncancel} style="--width:300px;--height:300px;--background-color:purple;">
	{#if confirm}
		{@const m = confirm}
		{#if m.title}
			<p>{confirm.title}</p>
		{/if}
		<p>{confirm.message}</p>
		<button
			onclick={() => {
				genericModals.close(modal);
				m.onResponse(false);
			}}>cancel</button
		>
		<button
			onclick={() => {
				genericModals.close(modal);
				m.onResponse(true);
			}}>confirm</button
		>
	{:else if info}
		{#if info.title}
			<p>{info.title}</p>
		{/if}
		<p>{info.message}</p>
	{:else}
		Unknown modal type: {modal.type}
	{/if}
</Modal>
