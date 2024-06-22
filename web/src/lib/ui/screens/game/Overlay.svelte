<script lang="ts">
	import {type GameView} from '$lib/state/ViewState';
	import BattleOverlay from './BattleOverlay.svelte';
	export let gameView: GameView;
</script>

{#if $gameView.inBattle}
	<BattleOverlay {gameView} />
{/if}
