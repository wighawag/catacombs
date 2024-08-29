import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';
// import {nodePolyfills} from 'vite-plugin-node-polyfills';
// const polyfills = nodePolyfills({include: ['buffer']}); // was required by tlock-js ?

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		minify: false,
		sourcemap: true,
	},
});
