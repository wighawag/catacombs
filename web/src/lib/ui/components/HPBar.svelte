<script lang="ts">
	import {tweened} from 'svelte/motion';
	import {cubicOut} from 'svelte/easing';

	interface Props {
		label?: string;
		value?: number;
		maxValue: number;
		infinite?: boolean;
	}

	let {label = 'HP', value = 0, maxValue, infinite = false}: Props = $props();

	const percentage = tweened(infinite ? 100 : Math.min(100, Math.max(0, (value / maxValue) * 100)), {
		duration: 1000,
		easing: cubicOut,
	});

	$effect(() => {
		percentage.set(infinite ? 100 : Math.min(100, Math.max(0, (value / maxValue) * 100)));
	});
	let smaller = $derived(value > 999 || (maxValue && maxValue > 999));
</script>

<div class="area">
	<div class="label">{label}</div>
	<div class="bar">
		<div class="bar-numbers">
			<div class="value" class:red={label === 'HP' && $percentage <= 15}>
				<strong>{Math.max(0, value)}</strong>
			</div>
			{#if !infinite}
				<div class="max-value">/{maxValue}</div>
			{/if}
		</div>
		<div class="bar-box">
			<div class="bar-fill" class:red={label === 'HP' && $percentage <= 15} style="width: {$percentage}%;"></div>
		</div>
	</div>
</div>

<style>
	.area {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.label {
		margin: 2px 2px 2px 0;
	}
	.bar {
		width: 100%;
		height: 14px;
		position: relative;
	}
	.bar-box {
		border: 1px solid gray;
		padding: 1px;
	}
	.bar-fill {
		height: 10px;
		background-color: white;
		mix-blend-mode: difference;
	}
	.bar-numbers {
		width: 100%;
		position: absolute;
		color: var(--color-surface-400);
		display: flex;
		font-size: 10px;
		justify-content: space-between;
		padding: 0 3px;
		color: white;
		box-sizing: border-box;
		align-items: flex-start;
	}

	.max-value,
	.value {
		font-size: 9px;
		letter-spacing: -0.02em;
	}

	.max-value {
		text-align: right;
		color: gray;
	}

	.red {
		background-color: red;
		mix-blend-mode: unset;
		transition: mix-blend-mode 0.2s linear;
	}
</style>
