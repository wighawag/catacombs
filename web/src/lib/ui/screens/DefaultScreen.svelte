<script lang="ts">
	import IconSkull from '$data/assets/skull-key-white.png'; // TODO remove ?
	import WelcomeProfile from '$lib/ui/screens/headers/WelcomeProfile.svelte';
	import BorderedContainer from '../components/BorderedContainer.svelte';

	export let header: string; // TODO options or element
	export let footer: string | undefined = undefined; // TODO options or element
	export let text: string | undefined = undefined;
	export let subtext: string | undefined = undefined;
	export let askKey = false;
	export let signIn = false;
	export let btnText: string;
	export let btnPressed: () => Promise<void>;
	export let btnDisabled: boolean;
</script>

{#if header === 'logo'}
	<header class="logo">
		<img style="height:63px" src={'/title.png'} alt="Ethernal" />
	</header>
{/if}

{#if header === 'profile'}
	<header class="default-screen--header">
		<WelcomeProfile />
	</header>
{/if}

{#if header === 'profile-usedKey'}
	<header class="default-screen--header">
		<WelcomeProfile />
	</header>
{/if}

<main>
	<BorderedContainer>
		<div class="content">
			<div></div>
			<div class="content-middle">
				{#if text}
					<h1>{text}</h1>
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
						Already started? <button role="link" on:click={async () => console.log('signning..')}>Sign in</button>
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
