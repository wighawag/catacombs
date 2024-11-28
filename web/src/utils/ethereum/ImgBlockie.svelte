<script lang="ts">
	import {Blockie} from '$utils/ethereum/blockie';
	interface Props {
		address: string;
		offset?: number;
		style?: string | undefined;
		rootClass?: string;
		onclick?: (event: MouseEvent) => void;
	}

	let {address, offset = 0, style = undefined, rootClass = '', onclick}: Props = $props();

	let uri = $derived(Blockie.getURI(address, offset));
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<img class={rootClass} {style} src={uri} alt={address} {onclick} />

<style>
	img {
		image-rendering: -moz-crisp-edges;
		image-rendering: -webkit-crisp-edges;
		image-rendering: crisp-edges;
		image-rendering: pixelated;
	}
</style>
