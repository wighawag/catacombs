<script lang="ts">
	import {createEventDispatcher} from 'svelte';

	const dispatch = createEventDispatcher();

	export let text: string;
	export let charTime = 50;

	export function skip() {
		text = 'dsdsa';
	}

	function emptyCharacters(str: string, start: number, extraCharactersAsRatio: number = 0) {
		let newStr = str.slice(0, start);
		for (let i = start; i < str.length; i++) {
			const char = str.charAt(i);
			if (char == ' ') {
				newStr += ' ';
			} else {
				newStr += '&nbsp;';
			}
		}
		for (let e = 0; e < Math.ceil((str.length - start) * extraCharactersAsRatio); e++) {
			newStr += '&nbsp;';
		}

		return newStr;
	}

	const extraCharactersAsRatio = 0;

	let lastText: string;
	let lastStartTime: number;
	let currentText: string = emptyCharacters(text, 0, extraCharactersAsRatio);
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
			currentText = emptyCharacters(text, 0, extraCharactersAsRatio);
		} else {
			currentText = emptyCharacters(text, i, extraCharactersAsRatio);
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

<p>{@html currentText}</p>

<style>
	p {
		font-family: monospace;
		font-size: 15px;
		text-align: left;
	}
</style>
