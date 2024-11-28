<script lang="ts">
	import {fly} from 'svelte/transition';
	import ModalContainer from './ModalContainer.svelte';
	import {type Cancellation} from './types.js';

	interface Props {
		oncancel?: Cancellation;
		onclosed?: Cancellation;
		style?: string | undefined;
		children?: import('svelte').Snippet;
	}

	let {
		oncancel = undefined,
		onclosed = undefined,
		style = undefined,
		children
	}: Props = $props();
</script>

<ModalContainer {oncancel} {onclosed}>
	<div class="modal" transition:fly={{y: '50vh'}} {style}>
		{@render children?.()}
	</div>
</ModalContainer>

<style>
	.modal {
		position: fixed;
		top: 0%;
		left: 0%;
		height: 100%;
		width: 100%;
		overflow: auto;
	}

	/*********************************************************************************************/
	/* CUSTOMIZATIONS */
	/*********************************************************************************************/
	.modal {
		left: 50%;
		transform: translate(-50%, 0%);
		bottom: 0;

		height: var(--height, 400px);
		max-height: 100%;

		width: 100%;
		top: unset;
		bottom: 0;
	}

	@media (min-width: 640px) {
		.modal {
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);

			width: var(--width, 600px);
			max-width: 100%;
		}
	}

	.modal {
		border: 12px double white;
	}
</style>
