<script lang="ts">
	import {account, connection, viemClient, network} from '$lib/blockchain/connection';
	import {menu} from './menu';
	import {admin} from '$lib/ui/admin/admin';
	import {debug} from '$lib/ui/debug/debug';
	import {fly} from 'svelte/transition';
	import {HelpCircle, Power} from 'lucide-svelte';
	import ImgBlockie from '$utils/ethereum/ImgBlockie.svelte';
	import {balance} from '$lib/state/balance';
	import {debugTools, dev} from '$lib/config';
	import {tooltip} from '$utils/ui/tooltip';
	import ModalContainer from '$utils/ui/modals/ModalContainer.svelte';

	$: isAdmin = false; //$account.address?.toLowerCase() === $contractsInfos.contracts.Game.linkedData.admin?.toLowerCase();

	function disconnect() {
		connection.disconnect();
	}

	$: connecting =
		$connection.connecting || $account.fetching || $network.loading || $account.isLoadingData != undefined;

	function computeShortAddress(address: string): string {
		return address.slice(0, 6) + '...' + address.slice(-4);
	}
</script>

{#if $menu.open}
	<ModalContainer oncancel={() => ($menu.open = false)}>
		<div class="menu" transition:fly={{x: '100%'}}>
			{#if $account.state === 'Connected' && !$account.locked}
				<div class="connected">
					<ImgBlockie address={$account.address} style="object-fit: cover;height: 2rem;width: 2rem;display: inline;" />
					<span class="address">{computeShortAddress($account.address)}</span>
					<button
						on:click={() => {
							$menu.open = false;
							disconnect();
						}}
						class="icon"
					>
						<Power></Power>
					</button>
				</div>

				<div class="category">
					<div>{name}</div>
					<hr />
				</div>

				{#if debugTools}
					<div class="category">
						<div>Debug</div>
						<hr />

						{#if dev}
							<button class="error" on:click={() => ($debug.open = true)}>Debug</button>
						{/if}

						{#if isAdmin}
							<button class="error" on:click={() => ($admin.open = true)}>Admin</button>
						{/if}
					</div>
				{/if}
			{:else if $account.locked}
				<div class="connected">
					{#if $account.address}
						<ImgBlockie
							address={$account.address}
							style="object-fit: cover;height: 2rem;width: 2rem;display: inline;"
						/>
						<span class="address">{computeShortAddress($account.address)}</span>
					{:else}
						<span>?</span>
						<span>...</span>
					{/if}

					<button
						on:click={() => {
							$menu.open = false;
							disconnect();
						}}
						class="icon"
					>
						<Power></Power>
					</button>
				</div>
				<div class="category">
					<button class="primary" disabled={$account.unlocking} on:click={() => account.unlock()}>unlock</button>
				</div>
			{:else}<div class="disconnected">
					<button disabled={connecting} class="primary" on:click={() => connection.connect()}
						>{connecting ? 'Connecting' : 'Connect Your Wallet'}</button
					>
				</div>
			{/if}
		</div>
	</ModalContainer>
{/if}

<style>
	.allowance {
		color: var(--color-primary-600);
	}
	.category {
		width: 100%;
		margin-bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	.category button {
		width: 100%;
	}
	.category a[role='button'] {
		width: 100%;
		text-align: center;
	}
	.info-line {
		display: flex;
		width: 100%;
		justify-content: space-between;
	}
	.connected {
		width: 100%;
		display: flex;
		margin-bottom: 1rem;
		gap: 0.5rem;
		align-items: center;
	}
	.address {
		max-width: calc(100% - 0px);
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
	.disconnected {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	hr {
		width: 100%;
		margin-bottom: 0.5rem;
		border: 1px solid var(--color-primary-500);
	}
	.menu {
		width: 100%;
		top: 2rem;
		pointer-events: auto;
		cursor: default;
		position: absolute;
		height: calc(100% - 2rem);
		overflow: auto;
		display: flex;
		flex-direction: column;
		justify-content: start;
		gap: 0.25rem;
		align-items: center;
		right: 0;
		list-style: none;
		padding: 16px;
		border-radius: 16px;

		background-color: var(--color-surface-800);
		border: 16px solid var(--color-text-on-surface);
		border-image: url(/game-assets/ui/border.png) 16 fill;
		image-rendering: pixelated;
	}

	@media (min-width: 640px) {
		.menu {
			width: 300px;
			top: 0;
		}
	}

	.menu a[role='button'] {
		display: inline-block;
	}

	.icon {
		margin-left: auto;
	}
	.icon :global(.lucide) {
		min-height: 1.5rem;
		min-width: 1.5rem;
	}

	.notification-badge {
		position: absolute;
		top: -0.7rem;
		right: -0.7rem;
		background-color: red;
		border-radius: 9999px;
		padding-inline: 0.6rem;
		padding-block: 0.2rem;
		font-size: 1rem;
	}
</style>
