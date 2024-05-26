import {indexAll} from './data/main';

async function main() {
	const state = await indexAll();
	console.log(state.characters);
}
main();
