import {camera} from '$lib/render/camera';
import {AREA_SIZE, areaCoord, type Area} from 'template-game-common';
import {EVMGame} from 'template-game-contracts-js';

export const areas = new Map<number, Map<number, Area>>();

export const evmGame = new EVMGame();

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
					const area = await evmGame.areaAt(x, y);
					mapmap.set(ay, area);
				} else {
					let area = mapmap.get(ay);
					if (!area) {
						area = await evmGame.areaAt(x, y);
						mapmap.set(ay, area);
					}
				}
			}
		}
	}
});
