export const AREA_SIZE = 11;
export const AREA_OFFSET = 5;

export function areaCoord(a: number): number {
	if (a >= 0) {
		return Math.floor((a + AREA_OFFSET) / AREA_SIZE);
	} else {
		return -Math.floor((-a + AREA_OFFSET) / AREA_SIZE);
	}
}

export function areaLocalCoord(x: number): number {
	return x - (areaCoord(x) * AREA_SIZE - AREA_OFFSET);
}

export function wallAt(walls: readonly boolean[], x: number, y: number): boolean {
	const xx = areaLocalCoord(x);
	const yy = areaLocalCoord(y);
	const i = yy * AREA_SIZE + xx;
	const wall = walls[i];
	if (wall == undefined) {
		return false;
	}
	return wall;
	// return ((walls >> (127n - i)) & 1n) == 1n;
}
