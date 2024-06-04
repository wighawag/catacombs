export type AreaAsBigInts = {southWalls: bigint; eastWalls: bigint; size: bigint};
export type AreaAsBooleanArrays = {southWalls: boolean[]; eastWalls: boolean[]; size: number};
export function parseAsciiArea(txt: string): {areaAsBigInts: AreaAsBigInts; areaAsBooleanArrays: AreaAsBooleanArrays} {
	const lines = txt.split(`\n`).filter((v) => v.length > 0);
	const numLines = lines.length;
	let lineIndex = 0;
	let sizeN = numLines / 2;
	if (sizeN != Math.floor(sizeN)) {
		throw new Error(`invalid number of lines, need to be multiple of 2`);
	}
	if (sizeN == 0) {
		throw new Error(`invalid number of lines, need to be greater than 1`);
	}
	if (sizeN > 11) {
		throw new Error(`invalid number of lines, need to be gless than 11`);
	}
	const size = BigInt(sizeN);
	let y = 0n;
	let southWalls = 0n;
	let eastWalls = 0n;
	let southWallsAsBooleanArray: boolean[] = [];
	let eastWallsAsBooleanArray: boolean[] = [];
	while (lineIndex < numLines) {
		const line = lines[lineIndex];
		if (lineIndex % 2 == 0) {
			// east walls
			const numWallsCharacters = line.length;
			const numCells = numWallsCharacters / 4;
			if (numCells != sizeN) {
				throw new Error(`invalid number of characters in the line`);
			}
			let charIndex = 3;
			let x = 0n;
			while (charIndex < numWallsCharacters) {
				const char = line.charAt(charIndex);
				if (char == '|') {
					// console.log(`east wall at ${x},${y}`);
					eastWalls |= 2n ** (127n - (y * size + x));
					eastWallsAsBooleanArray.push(true);
				} else {
					eastWallsAsBooleanArray.push(false);
				}
				charIndex += 4;
				x++;
			}
		} else {
			// south walls
			const numWallsCharacters = line.length;
			const numCells = numWallsCharacters / 4;
			if (numCells != sizeN) {
				throw new Error(`invalid number of characters in the line`);
			}
			let charIndex = 1;
			let x = 0n;
			while (charIndex < numWallsCharacters) {
				const char = line.charAt(charIndex);
				if (char == '_') {
					if (line.charAt(charIndex - 1) !== '_' || line.charAt(charIndex + 1) !== '_') {
						console.error(`please use triple "_" for south walls: ${x},${y}`);
					}
					// console.log(`south wall at ${x},${y}`);
					southWalls |= 2n ** (127n - (y * size + x));
					southWallsAsBooleanArray.push(true);
				} else {
					southWallsAsBooleanArray.push(false);
				}
				charIndex += 4;
				x++;
			}
			y++;
		}

		lineIndex++;
	}

	return {
		areaAsBigInts: {southWalls, eastWalls, size},
		areaAsBooleanArrays: {southWalls: southWallsAsBooleanArray, eastWalls: eastWallsAsBooleanArray, size: Number(size)},
	};
}
