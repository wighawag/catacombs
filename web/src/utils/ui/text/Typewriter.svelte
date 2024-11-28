<script lang="ts">
	import {typewrite} from './typewriter';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<p use:typewrite>{@render children?.()}</p>

<style>
	p:not(.stopped) {
		&:after {
			content: '|';
			animation: blink 500ms linear infinite alternate;
		}
	}
</style>
