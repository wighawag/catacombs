import {parseAsciiArea} from '../data/parseAsciiArea';
import fs from 'node:fs';

function wallsToString(walls: bigint, size: bigint): string {
	const pad = size * size;
	return (walls >> (128n - pad))
		.toString(2)
		.padStart(Number(pad), '0')
		.match(/(.{1,11})/g)
		?.join(`\n`) as string;
}

function main(args: string[]) {
	const filename = args[0];
	const areaTXT = fs.readFileSync(filename, 'utf-8');
	const {southWalls, eastWalls, size} = parseAsciiArea(areaTXT);
	console.log(wallsToString(southWalls, size));
	console.log(`------------------`);
	console.log(wallsToString(eastWalls, size));
}

main(process.argv.slice(2));
