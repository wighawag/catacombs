<script>
	import {fade} from 'svelte/transition';
</script>

<div class="content" transition:fade>
	<div class="text">A skeleton jumped out from the corner of the room.</div>
	<div class="monster">
		<img alt="skeleton" src="/images/monsters/skeleton.png" />
	</div>
	<div class="actions">
		<button>Battle!</button>
	</div>
</div>

<style>
	.content {
		padding: 2rem;
		width: 100%;
		height: 100%;
		background-color: black;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.text {
		display: flex;
		justify-content: center;
	}

	.monster {
		display: flex;
		justify-content: center;
		/* background-color: red; */
	}

	.monster img {
		width: 256px;
		image-rendering: pixelated;
		filter: sepia() hue-rotate(50deg) brightness(80%);
		/* opacity: 0.7; */
	}

	.actions {
		display: flex;
		justify-content: center;
	}

	.actions button {
		width: 100%;
		height: 2rem;
		font-size: 1.2rem;
	}
</style>
