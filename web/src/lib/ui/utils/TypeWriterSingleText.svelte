<script lang="ts">
	import {createEventDispatcher} from 'svelte';

	const dispatch = createEventDispatcher();

	export let text: string;
	export let charTime = 50;

	export function skip() {
		text = 'dsdsa';
	}

	let lastText: string;
	let lastStartTime: number;
	let currentText: string | null = null;
	let duration: number;
	let doneEmitted: boolean;

	const update = (now: number) => {
		if (text !== lastText) {
			doneEmitted = false;
			// console.log('replacing ' + lastText + ' with ' + text);
			lastText = text;
			lastStartTime = now;
			duration = text.length * charTime;
			// console.log({lastStartTime, now, duration});
		}
		const t = (now - lastStartTime) / duration;

		// eslint-disable-next-line no-bitwise
		const i = ~~(text.length * t);
		if (i === 0) {
			currentText = null;
		} else {
			currentText = text.slice(0, i);
		}

		if (!doneEmitted && now - lastStartTime > duration) {
			doneEmitted = true;
			// console.log('DONE');
			dispatch('done');
		}
		window.requestAnimationFrame(update);
	};

	update(performance.now());
</script>

{#if currentText == null}
	<p>&nbsp;</p>
{:else}
	<p>{currentText}</p>
{/if}
