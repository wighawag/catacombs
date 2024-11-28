<script lang="ts">
	import {page} from '$app/stores';
	import {route, isParentRoute, isSameRoute} from '$utils/path';

	interface Props {
		href: string;
		children?: import('svelte').Snippet;
	}

	let { href, children }: Props = $props();

	let current = $derived(href === '/' ? isSameRoute($page.url.pathname, href) : isParentRoute($page.url.pathname, href));
</script>

<a class:current href={route(href)}>{@render children?.()}</a>

<style>
	a {
		text-decoration: none;
		display: inline-block;
		color: var(--color-text-on-surface);

		font-size: 0.875rem;
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
		padding-inline: 16px;
		padding-block: 2px;
		line-height: 2;

		&:hover {
			text-decoration: underline;
		}
	}

	.current {
		font-weight: bold;
		color: var(--color-text-on-primary-500);
		background-color: var(--color-primary-500);

		pointer-events: none;
	}
</style>
