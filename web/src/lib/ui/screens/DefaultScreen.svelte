<script lang="ts">
	import IconSkull from '$data/assets/skull-key-white.png'; // TODO remove ?
	import {connection} from '$lib/state';
	import WelcomeProfile from '$lib/ui/screens/headers/WelcomeProfile.svelte';
	import BorderedContainer from '../components/BorderedContainer.svelte';

	export let header: string; // TODO options or element
	export let footer: string | undefined = undefined; // TODO options or element
	export let text: string | undefined = undefined;
	export let subtext: string | undefined = undefined;
	export let askKey = false;
	export let signIn = false;
	export let signOut = false;
	export let btnText: string | undefined = undefined;
	export let btnPressed: (() => Promise<void> | void) | undefined = undefined;
	export let btnDisabled: boolean = false;
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
					<slot />
				{/if}
				{#if subtext}
					<p class="subtext">{subtext}</p>
				{/if}
			</div>
			<div></div>

			<div class="content-bottom">
				{#if btnText}
					<button disabled={btnDisabled} class="wide full" on:click={btnPressed}>{btnText}</button>
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
						Already started? <button role="link" on:click={async () => connection.loginWithEmail()}>Sign in</button>
					</p>
				{/if}

				{#if signOut}
					<p class="sign-in">
						Want to switch account? <button role="link" on:click={async () => connection.logout()}>Sign out</button>
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
