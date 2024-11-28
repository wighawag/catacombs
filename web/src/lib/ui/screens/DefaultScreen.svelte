<script lang="ts">
	import IconSkull from '$data/assets/skull-key-white.png'; // TODO remove ?
	import {connection} from '$lib/state/connection';
	import WelcomeProfile from '$lib/ui/screens/headers/WelcomeProfile.svelte';
	import {shortAddress} from '$utils/ethereum/format';
	import BorderedContainer from '../components/BorderedContainer.svelte';

	type ButtonData = {text: string; func: () => Promise<void> | void; disabled?: boolean};

	interface Props {
		header: string; // TODO options or element
		footer?: string | undefined; // TODO options or element
		text?: string | undefined;
		subtext?: string | undefined;
		askKey?: boolean;
		signIn?: boolean;
		signOut?: boolean;
		btn?: ButtonData[];
		children?: import('svelte').Snippet;
	}

	let {
		header,
		footer = undefined,
		text = undefined,
		subtext = undefined,
		askKey = false,
		signIn = false,
		signOut = false,
		btn = [],
		children
	}: Props = $props();

	let currentButton = $derived(btn.reduce<ButtonData | undefined>((prev, curr) => {
		if (!prev || prev.disabled) {
			if (!curr.disabled) {
				return curr;
			}
			return curr;
		}
		return prev;
	}, undefined));
</script>

{#if header === 'logo'}
	<header class="logo">
		<img src={'/title.png'} alt="Ethernal" />
	</header>
{/if}

{#if header === 'profile'}
	<header>
		<WelcomeProfile />
	</header>
{/if}

{#if header === 'profile-usedKey'}
	<header>
		<WelcomeProfile />
	</header>
{/if}

<main>
	<BorderedContainer>
		<div class="content">
			<div></div>
			<div class="content-middle">
				{#if text}
					<h2>{text}</h2>
				{:else}
					{@render children?.()}
				{/if}
				{#if subtext}
					<p class="subtext">{subtext}</p>
				{/if}
			</div>
			<div></div>

			<div class="content-bottom">
				{#if currentButton}
					<button disabled={currentButton.disabled} class="wide full" onclick={currentButton.func}
						>{currentButton.text}</button
					>
				{/if}

				{#if askKey}
					<p class="card">
						Get a claim key by tweeting
						<i>"open sesame"</i>
						to
						<a href="https://twitter.com/etherplay" target="_blank" rel="noopener noreferrer">@Etherplay</a>
					</p>
				{/if}

				{#if signIn}
					<p class="sign-in">
						Already started? <button role="link" onclick={async () => connection.loginWithEmail()}>Sign in</button>
					</p>
				{/if}

				{#if signOut}
					<p class="sign-in">
						{#if $connection.email}Signed as {$connection.email}{:else if $connection.mainAccount}
							signed from <a
								target="_blank"
								rel="noreferrer noopener"
								href={`https://etherscan.io/address/${$connection.mainAccount}`}
								>{shortAddress($connection.mainAccount)}</a
							>{:else}Want to switch account?
						{/if}
						<button role="link" onclick={async () => connection.logout()}>Sign out</button>
					</p>
				{/if}
			</div>
		</div>
	</BorderedContainer>
</main>

<footer>
	{#if footer === 'social'}
		<p>
			Follow
			<a href="https://twitter.com/etherplay" target="_blank" rel="noopener noreferrer">@Etherplay</a>
			for updates
		</p>
	{/if}
</footer>

<style>
	.logo {
		display: flex;
		justify-items: center;
	}
	.logo > img {
		height: 100%;
	}

	.sign-in {
		margin-top: 1rem;
		color: var(--color-text-highlight-500);
	}

	.content {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-direction: column;
	}

	.content-middle {
		text-align: center;
		/* height: 100%; */
		width: 100%;
	}

	.content-bottom {
		text-align: center;
		/* height: 100%; */
		width: 100%;
	}
</style>
