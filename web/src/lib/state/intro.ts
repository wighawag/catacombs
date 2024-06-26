import {writable} from 'svelte/store';

export type IntroState = {
	character?: {
		name: string;
		classIndex: number;
	};
};

const $store: IntroState = {};
const store = writable<IntroState>($store);

function selectCharacter(name: string, classIndex: number) {
	$store.character = {name, classIndex};
	store.set($store);
}

export const intro = {
	$store,
	subscribe: store.subscribe,
	selectCharacter,
};

if (typeof window != 'undefined') {
	(window as any).intro = intro;
	(window as any).$intro = $store;
}
