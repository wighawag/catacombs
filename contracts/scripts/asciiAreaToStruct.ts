import {parseAsciiArea} from '../data/parseAsciiArea';
import Handlebars from 'handlebars';
import fs from 'node:fs';
import path from 'node:path';

type AreaAsBigIntStrings = {southWalls: string; eastWalls: string; size: number};
type AreaAsBooleanArrays = {southWalls: boolean[]; eastWalls: boolean[]; size: number};
export type AreaData = {
	ascii: string;
	areaAsBigInts: AreaAsBigIntStrings;
	areaAsBooleanArrays: AreaAsBooleanArrays;
};

function wallsToString(walls: bigint, size: bigint): string {
	const pad = size * size;
	return (walls >> (128n - pad))
		.toString(2)
		.padStart(Number(pad), '0')
		.match(/(.{1,11})/g)
		?.join(`\n`) as string;
}

function fileToData(filename: string): AreaData {
	const areaTXT = fs.readFileSync(filename, 'utf-8');
	const {areaAsBigInts, areaAsBooleanArrays} = parseAsciiArea(areaTXT);

	// console.log(wallsToString(southWalls, size));
	// console.log(`------------------`);
	// console.log(wallsToString(eastWalls, size));
	return {
		areaAsBigInts: {
			southWalls: areaAsBigInts.southWalls.toString(),
			eastWalls: areaAsBigInts.eastWalls.toString(),
			size: Number(areaAsBigInts.size),
		},
		areaAsBooleanArrays: {
			southWalls: areaAsBooleanArrays.southWalls,
			eastWalls: areaAsBooleanArrays.eastWalls,
			size: Number(areaAsBooleanArrays.size),
		},
		ascii: areaTXT,
	};
}

function main(args: string[]) {
	const folder = args[0];
	const files = fs.readdirSync(folder);
	const areasAsBigIntStrings: (AreaAsBigIntStrings & {ascii: string})[] = [];
	const areasAsBooleanArrays: (AreaAsBooleanArrays & {ascii: string})[] = [];
	for (const file of files) {
		console.log(`paring ${file}...`);
		const data = fileToData(path.join(folder, file));
		areasAsBigIntStrings.push({...data.areaAsBigInts, ascii: data.ascii});
		areasAsBooleanArrays.push({...data.areaAsBooleanArrays, ascii: data.ascii});
	}

	const templateTXT = fs.readFileSync('./data/Areas.sol.hbs', 'utf-8');
	const template = Handlebars.compile(templateTXT);
	const fileContent = template({areas: areasAsBigIntStrings});
	try {
		fs.mkdirSync('./src/game/data/', {recursive: true});
	} catch {}
	fs.writeFileSync(`./src/game/data/Areas.sol`, fileContent);

	const TStemplateTXT = fs.readFileSync('./data/Areas.ts.hbs', 'utf-8');
	const TStemplate = Handlebars.compile(TStemplateTXT);
	const TSfileContent = TStemplate({areas: areasAsBooleanArrays});
	try {
		fs.mkdirSync('./src/game/data/', {recursive: true});
	} catch {}
	fs.writeFileSync(`./dist/Areas.ts`, TSfileContent);
}

main(process.argv.slice(2));
