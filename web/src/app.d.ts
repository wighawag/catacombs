// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module 'svelte/elements' {
	export interface HTMLImageElement {
		// Svelte 4
		onload?: FormEventHandler<HTMLInputElement> | undefined | null;
		// Svelte 5
		onaccept?: FormEventHandler<T> | undefined | null;
	}
}

export {};
