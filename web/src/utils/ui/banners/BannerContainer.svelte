<script lang="ts" module>
	import type {TypedEventTarget} from '$utils/types/events';

	class BannerStack extends (EventTarget as TypedEventTarget<{
		added: CustomEvent<BannerOnStack>;
		removed: CustomEvent<BannerOnStack>;
	}>) {
		list: BannerOnStack[] = [];
		add(banner: BannerOnStack) {
			this.list.push(banner);
			this.dispatchEvent(new CustomEvent('added', {detail: banner}));
		}
		remove(banner: BannerOnStack) {
			const i = this.list.indexOf(banner);
			if (i >= 0) {
				this.list.splice(i, 1);
			}
			this.dispatchEvent(new CustomEvent('removed', {detail: banner}));
		}

		dismiss() {
			const lastElemIndex = this.list.length - 1;
			if (lastElemIndex >= 0) {
				const banner = this.list[lastElemIndex];
				if (banner.ondismiss) {
					return banner.ondismiss();
				}
			}
		}
	}
	export let bannerStack = new BannerStack();
</script>

<script lang="ts">
	import {onMount} from 'svelte';
	import type {BannerOnStack} from './types.js';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let element: HTMLElement = $state();
	let banner: BannerOnStack;
	onMount(() => {
		console.log('add banner', banner);
		banner = {element};
		bannerStack.add(banner);
		// return () => {
		// 	console.log('remove banner', banner);
		// 	bannerStack.remove(banner);
		// };
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="banner-container" bind:this={element}>
	{@render children?.()}
</div>

<style>
	.banner-container {
		pointer-events: auto;
		display: flex;
		place-content: center;
	}
</style>
