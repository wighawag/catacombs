<script lang="ts">
	import HPBar from '../../components/HPBar.svelte';
	import IconSkull from '$data/assets/skull-key-white.png';
	import {characterClassInfo, portrait} from '$lib/data/characters';
	import {intro} from '$lib/state/intro';
	import type {GameView} from '$lib/state/ViewState';

	interface Props {
		characterClass?: number;
		gameView?: GameView | undefined;
	}

	let {gameView = undefined}: Props = $props();

	let characterClass = $derived($intro.character?.classIndex || 0);
	let classPortrait = $derived(portrait(characterClass));
	let characterClassName = $derived(characterClassInfo(characterClass).name);

	let xp = $derived($gameView && $gameView.currentCharacter ? $gameView.currentCharacter.xp : 0);
	let hp = $derived($gameView && $gameView.currentCharacter ? $gameView.currentCharacter.hp : 50); // TODO
</script>

<div class="welcome-header-box">
	<div class="box">
		<button class="icon">
			<img src={classPortrait} alt="profile" />
		</button>

		<div class="info-area">
			<div>LVL.&nbsp;0&nbsp;&nbsp;&nbsp;</div>
			<HPBar label="XP" value={xp} maxValue={15} />
		</div>

		<div class="info-area">
			<div>{characterClassName}</div>
			<HPBar value={hp} maxValue={50} />
		</div>
	</div>
	<div class="text-right">
		<div><img class="small" src={IconSkull} alt="key" /> 1</div>
		<!-- <div>$ <span class="highlight">{'0'}</span></div> -->
	</div>
</div>

<style>
	.welcome-header-box {
		width: 100%;
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	.box {
		display: flex;
		font-size: 0.6rem;
		flex-grow: 1;
	}
	.icon {
		height: 100%;
		width: 48px;
		border: 1px white dashed;
	}
	.text-right {
		font-size: 0.6rem;
	}
	img {
		display: inline-block;
		height: 100%;
	}
	.info-area {
		margin-left: 0.4rem;
		max-width: 14rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		flex: 1;
	}

	.small {
		height: 11px;
		width: auto;
		margin-right: 5px;
	}
</style>
