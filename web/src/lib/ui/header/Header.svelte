<script lang="ts">
	import ConnectButton from '$lib/blockchain/connection/ConnectButton.svelte';
	import {route, url} from '$utils/path';

</script>

<header>
	<div class="top">
		<!-- <nav>
			<ol>
				<li><PageLink href={'/'}>World</PageLink></li>
				<li><PageLink href={'/debug/'}>Debug</PageLink></li>
				<li><PageLink href={'/about/'}>About</PageLink></li>
			</ol>
		</nav> -->
		<!-- <div></div> -->
		<a href={route('/')}><img src={url('/title.png')} alt="Game Title" style="max-height: 48px" /></a>
		<div class="right">
			<ConnectButton></ConnectButton>
		</div>
	</div>
	<slot />
</header>

<style>
	.right {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	header {
		top: 0;
		position: sticky;
	}

	.top {
		pointer-events: auto;
		display: flex;
		gap: 1rem;
		justify-content: space-between;
		align-items: center;
		padding: 8px;
		background-color: var(--color-surface-500);
		border-bottom: 4px solid var(--color-primary-500);
	}

	/* nav ol {
		display: flex;
		justify-content: flex-start;
		margin: 0;
		list-style-type: none;
	} */
</style>
