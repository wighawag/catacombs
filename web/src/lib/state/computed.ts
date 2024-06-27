import {initialContractsInfos} from '$lib/config';
import {camera} from '$lib/render/camera';
import {AREA_SIZE, areaCoord, type Area} from 'template-game-common';
import {createTEVMContracts} from 'template-game-contracts-js';
// TODO artifact export as esm module same for contracts
import artifacts from 'template-game-contracts/artifacts';

export const areas = new Map<number, Map<number, Area>>();

export const {contracts, client} = createTEVMContracts(artifacts);

async function getJSArea(x: number, y: number) {
	const area = await client.readContract(contracts.GameUtils.read.areaAt(x, y));
	const southWalls: boolean[] = [];
	const eastWalls: boolean[] = [];
	let c = 127n;
	for (let iy = 0; iy < AREA_SIZE; iy++) {
		for (let ix = 0; ix < AREA_SIZE; ix++) {
			southWalls.push(((area.southWalls >> c) & 1n) == 1n);
			eastWalls.push(((area.eastWalls >> c) & 1n) == 1n);
			c--;
		}
	}
	return {southWalls, eastWalls, x, y};
}

camera.subscribe(async ($camera) => {
	if ($camera) {
		for (
			let y = Math.floor($camera.y - $camera.height / 2 - 1);
			y < Math.ceil($camera.y + $camera.height / 2 + AREA_SIZE);
			y += AREA_SIZE
		) {
			for (
				let x = Math.floor($camera.x - $camera.width / 2 - 1);
				x < Math.ceil($camera.x + $camera.width / 2 + AREA_SIZE);
				x += AREA_SIZE
			) {
				const ax = areaCoord(x); // TODO could also be computed onchain
				const ay = areaCoord(y);
				const mapmap = areas.get(ax);
				if (!mapmap) {
					const mapmap = new Map<number, Area>();
					areas.set(ax, mapmap);
					const area = await getJSArea(x, y);
					mapmap.set(ay, area);
				} else {
					let area = mapmap.get(ay);
					if (!area) {
						const area = await getJSArea(x, y);
						mapmap.set(ay, area);
					}
				}
			}
		}
	}
});
