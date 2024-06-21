<script lang="ts">
	import {type GameView} from '$lib/state/ViewState';
	import Modal from '$utils/ui/modals/Modal.svelte';
	export let gameView: GameView;
</script>

{#if $gameView.inBattle}
	<Modal><div class="content">Battle</div></Modal>
{/if}

<style>
	.content {
		width: 100%;
		height: 100%;
		background-color: black;
	}
</style>
