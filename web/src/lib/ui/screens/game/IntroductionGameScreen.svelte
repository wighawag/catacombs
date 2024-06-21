<script lang="ts">
	import {gameView} from '$lib/state/IntroductionViewState';
	import MainGameScreen from './MainGameScreen.svelte';
</script>

<MainGameScreen {gameView} />
