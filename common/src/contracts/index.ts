export const AREA_SIZE = 11;
export const AREA_OFFSET = 5;

export function areaCoord(a: number): number {
	if (a >= 0) {
		return Math.floor((a + AREA_OFFSET) / AREA_SIZE);
	} else {
		return -Math.floor((-a + AREA_OFFSET) / AREA_SIZE);
	}
}
