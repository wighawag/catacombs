<script lang="ts">
	import {gameView} from '$lib/state/IntroductionViewState';
	import MainGameScreen from '../game/MainGameScreen.svelte';
</script>

<MainGameScreen {gameView} />
