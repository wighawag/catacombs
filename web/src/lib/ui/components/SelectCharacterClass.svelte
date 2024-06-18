<script lang="ts">
	import {characterClassInfo, portrait} from '$lib/data/characters';

	export let name: string;
	export let characterClassIndex: number = 0;

	$: classInfo = characterClassInfo(characterClassIndex);

	$: console.log({
		characterClassIndex,
	});
</script>

<h3>Select a class</h3>
<div class="container">
	<label class:disabled={characterClassIndex != 0} class="selection-box">
		<input type="radio" bind:group={characterClassIndex} value={'0'} />
		<img src={portrait(0)} alt={characterClassInfo(0).name} />
	</label>
	<label class:disabled={characterClassIndex != 1} class="selection-box">
		<input type="radio" bind:group={characterClassIndex} value={'1'} />
		<img src={portrait(1)} alt={characterClassInfo(1).name} />
	</label>
	<label class:disabled={characterClassIndex != 2} class="selection-box">
		<input type="radio" bind:group={characterClassIndex} value={'2'} />
		<img src={portrait(2)} alt={characterClassInfo(2).name} />
	</label>
	<label class:disabled={characterClassIndex != 3} class="selection-box">
		<input type="radio" bind:group={characterClassIndex} value={'3'} />
		<img src={portrait(3)} alt={characterClassInfo(3).name} />
	</label>
</div>
<div class="container description">
	<div>
		<h4>{classInfo.name}</h4>
		<ul>
			{#each classInfo.descriptions as desc}
				<li>{desc}</li>
			{/each}
		</ul>
	</div>
</div>

<div class="input-container">
	<label for="name">Name your character</label>
	<input id="name" maxlength="19" type="text" placeholder="..." bind:value={name} />
</div>

<style>
	.container {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		margin-left: 20px;
		margin-right: 20px;
		margin-bottom: 20px;
	}
	.selection-box {
		cursor: pointer;
		display: block;
		text-align: center;
		transition: opacity 0.1s ease-in-out;

		&.disabled {
			opacity: 0.24;

			&:hover {
				opacity: 0.64;
			}
		}
	}

	.selection-box > input {
		display: none;
	}
	img {
		border: 1px solid gray;
		padding: 2px;
	}

	img {
		width: 46px;
		height: 46px;
	}
	h3 {
		margin-top: 0px;
		margin-bottom: 25px;
	}
	.input-container {
		padding: 12px 0 44px;
	}
	input {
		margin-top: 4px;
		border: 3px solid gray;
		background: transparent;
		color: white;
		outline: none;
	}
	input:focus {
		border-color: white;
	}
	.description {
		flex-direction: column;
		border: 1px solid gray;
		justify-content: start;
		text-align: left;
		padding: 10px;
		height: 110px;
	}

	ul {
		margin-left: 25px;
	}
</style>
