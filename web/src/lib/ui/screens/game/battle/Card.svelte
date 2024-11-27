<script lang="ts">
	import IconSkull from '$data/assets/skull-key-white.png'; // TODO remove ?

	export let disabled = false;
	export let enemy = false;
	export let value: number;
	export let bonus: number;
</script>

<button class="card" class:disabled class:enemy class:hoverable={!disabled && !enemy}>
	<div class="top">
		<div>DEF</div>
		<div>{value}</div>
	</div>
	<div class="center"><img alt="defense" src={IconSkull} /></div>
	<div class="bottom">
		<div>{bonus}</div>
		<div class="armor">ARMOR</div>
	</div>
</button>

<style>
	.card {
		background-color: black;
		color: white;
		font-size: smaller;
		width: 64px;
		height: 64px;
		border: gray solid 2px;
		padding: 0.1rem 0.1rem 0rem 0.1rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.hoverable:hover {
		transform: scale(1.2);
		transition-duration: 0.2s;
		z-index: 2;
	}
	/* .enemy {
		color: red;
	} */
	.enemy {
		border: red solid 2px;
	}

	/* .enemy .armor {
		color: red;
	} */
	.center {
		width: 100%;
		display: flex;
		display: flex;
		justify-content: center;
	}
	.center img {
		width: 20px;
		height: 20px;
	}
	.disabled {
		opacity: 0.3;
	}
	.top {
		width: 100%;
		display: flex;
		justify-content: space-between;
	}
	.bottom {
		display: flex;
		justify-content: space-between;
		align-items: end;
	}
	.armor {
		color: #5a5a5a;
		font-size: x-small;
	}
</style>
