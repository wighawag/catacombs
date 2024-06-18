<script lang="ts">
	import '../css/index.css';
	import EraseNotice from '$lib/ui/components/EraseNotice.svelte';
	import Banners from '$utils/ui/banners/Banners.svelte';
	import VersionAndInstallNotfications from '$lib/ui/install/VersionAndInstallNotfications.svelte';
	import Modals from '$utils/ui/modals/Modals.svelte';
	import {url} from '$utils/path';
	import Web3ConnectionUI from '$lib/blockchain/connection/Web3ConnectionUI.svelte';
	import Flow from '$lib/actions/flow/Flow.svelte';

	import {dev, initialContractsInfos, params} from '$lib/config';
	import Head from './Head.svelte';
	import Menu from '$lib/ui/menu/Menu.svelte';
	import Admin from '$lib/ui/admin/Admin.svelte';
	import SplashScreen from '$lib/ui/loading/SplashScreen.svelte';
	import Debug from '$lib/ui/debug/Debug.svelte';
	import RevealPhaseInformation from '$lib/ui/information/RevealPhaseInformation.svelte';
</script>

<!-- add head, meta, sentry and other debug utilties-->
<Head />
<!-- -->

<div style="position: absolute; z-index: 2; width: 100%; height: 100%; pointer-events: none;overflow: hidden;">
	<Menu />

	<Admin />

	<Debug />

	<RevealPhaseInformation />

	<Modals />

	<Banners />

	<VersionAndInstallNotfications src={url('/icon.png')} alt="Game" />

	<EraseNotice />

	<Web3ConnectionUI />

	<Flow />

	<SplashScreen />
</div>

<slot />
