<script lang="ts">
	import {type GameView} from '$lib/state/ViewState';
	import Modal from '$utils/ui/modals/Modal.svelte';
	export let gameView: GameView;
</script>

{#if $gameView.inBattle}
	<Modal>Battle</Modal>
{/if}
