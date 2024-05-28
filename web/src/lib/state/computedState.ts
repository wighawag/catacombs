import {createEVMRunner} from 'template-game-contracts-js';
import artifacts from 'template-game-contracts/artifacts';
import {decodeFunctionResult, encodeFunctionData} from 'viem';
import {derived, writable} from 'svelte/store';
import {epochState, type EpochState} from '$lib/state/Epoch';
import {camera} from '$lib/render/camera';
import {xyToBigIntID} from 'template-game-common';

const store = writable('');

async function getArea(x: number, y: number): Promise<Area> {
	const evm = await createEVMRunner({
		GameUtils: {
			bytecode: artifacts.GameUtils.bytecode,
		},
	});

	const result = await evm.runContract(
		'GameUtils',
		encodeFunctionData({
			abi: artifacts.GameUtils.abi,
			functionName: 'areaAt',
			args: [x, y],
		}),
	);

	let data: {southWalls: bigint; eastWalls: bigint};
	try {
		data = decodeFunctionResult({
			abi: artifacts.GameUtils.abi,
			functionName: 'areaAt',
			data: result,
		});
	} catch (err) {
		console.error(`error computing area`, {
			x,
			y,
			result,
		});
		throw err;
	}

	const southWalls: boolean[] = [];
	const eastWalls: boolean[] = [];
	let c = 127n;
	for (let iy = 0; iy < AREA_SIZE; iy++) {
		for (let ix = 0; ix < AREA_SIZE; ix++) {
			southWalls.push(((data.southWalls >> c) & 1n) == 1n);
			eastWalls.push(((data.eastWalls >> c) & 1n) == 1n);
			c--;
		}
	}

	return {
		x,
		y,
		eastWalls,
		southWalls,
	};
}

const AREA_SIZE = 11;
const AREA_OFFSET = 5;
function areaCoord(a: number): number {
	if (a >= 0) {
		return Math.floor((a + AREA_OFFSET) / AREA_SIZE);
	} else {
		return -Math.floor((-a + AREA_OFFSET) / AREA_SIZE);
	}
}

type Area = {
	x: number;
	y: number;
	eastWalls: boolean[];
	southWalls: boolean[];
};

export const areas = new Map<number, Map<number, Area>>();

camera.subscribe(async ($camera) => {
	if ($camera) {
		for (
			let y = $camera.y - $camera.renderHeight / 2 - 1;
			y < $camera.y + $camera.renderHeight / 2 + 1;
			y += AREA_SIZE
		) {
			for (
				let x = $camera.x - $camera.renderWidth / 2 - 1;
				x < $camera.x + $camera.renderWidth / 2 + 1;
				x += AREA_SIZE
			) {
				const ax = areaCoord(x); // TODO could also be computed onchain
				const ay = areaCoord(y);
				const mapmap = areas.get(ax);
				if (!mapmap) {
					const mapmap = new Map<number, Area>();
					areas.set(ax, mapmap);
					const area = await getArea(ax, ay);
					mapmap.set(ay, area);
				} else {
					let area = mapmap.get(ay);
					if (!area) {
						area = await getArea(ax, ay);
						mapmap.set(ay, area);
					}
				}
			}
		}
	}
});
