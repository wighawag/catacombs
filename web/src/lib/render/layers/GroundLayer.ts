import {gameView, type GameViewState} from '$lib/state/ViewState';
import type {CameraState} from '../camera';
import {Textured2DProgram, type Attributes} from '../programs/Textured2D';
import * as twgl from 'twgl.js';
import * as m3 from '$utils/m3';
import sheetURL from '$data/assets/tiles.png';
import sheet from '$data/assets/tiles.json';
import {drawTile, drawTileCol, drawTileRow, drawTileX2y2, type FrameDataWithUV} from '../programs/tiles';
import {areas} from '$lib/state/computed';
import {AREA_OFFSET, AREA_SIZE, areaCoord} from 'template-game-common';

type SheetData = typeof sheet;

type TextureData = {
	[Property in keyof SheetData['frames']]: FrameDataWithUV;
};

const size = sheet.meta.size;
function uvs(value: FrameDataWithUV, factor: number) {
	factor = Math.min(Math.max(factor, 1), Math.max(value.frame.h, value.frame.w));
	// TODO remove 0.5
	const wFactor = Math.min(factor, value.frame.w);
	const hFactor = Math.min(factor, value.frame.h);
	const x = (value.frame.x + wFactor * 0.5) / size.w;
	const y = (value.frame.y + hFactor * 0.5) / size.h;
	const w = Math.max(value.frame.w - wFactor, 1) / size.w;
	const h = Math.max(value.frame.h - hFactor, 1) / size.h;
	const x1 = x;
	const x2 = x + w;
	const y1 = y;
	const y2 = y + h;
	return [x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2];
}

const texPerSprites: TextureData = sheet.frames as any;
for (const key of Object.keys(texPerSprites)) {
	const value = (texPerSprites as any)[key] as FrameDataWithUV;
	const x = value.frame.x / size.w;
	const y = value.frame.y / size.h;
	const w = value.frame.w / size.w;
	const h = value.frame.h / size.h;
	value.uvFrame = {
		x,
		y,
		w,
		h,
	};
	const x1 = x;
	const x2 = x + w;
	const y1 = y;
	const y2 = y + h;
	value.uv = [x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2];
	value.uvs = [uvs(value, 1), uvs(value, 2), uvs(value, 4), uvs(value, 8), uvs(value, 16)];
}

export class GroundLayer extends Textured2DProgram {
	constructor(size: number) {
		super(size);
	}

	initialize(GL: WebGL2RenderingContext): void {
		super.initialize(GL);
		this.textures = twgl.createTextures(GL, {
			sheet: {src: sheetURL, mag: GL.NEAREST},
		});
	}

	drawArea(state: GameViewState, x: number, y: number) {
		if (state.stage === 'intro') {
			if (x >= 3 || x <= -3 || y >= 3 || y <= -3) {
				return;
			}

			if (y == 2) {
				for (let ix = -AREA_OFFSET; ix < AREA_SIZE - AREA_OFFSET; ix++) {
					drawTile(
						this.attributes,
						x * AREA_SIZE + ix - 3 / 22,
						y * AREA_SIZE + AREA_SIZE - AREA_OFFSET - 1 + 19 / 22,
						texPerSprites['new_wall_horiz.png'],
						28 / 22,
						11 / 22,
						1,
					);
				}
			}

			if (y == -2) {
				for (let ix = -AREA_OFFSET; ix < AREA_SIZE - AREA_OFFSET; ix++) {
					drawTile(
						this.attributes,
						x * AREA_SIZE + ix - 3 / 22,
						y * AREA_SIZE - AREA_SIZE + AREA_OFFSET + 19 / 22,
						texPerSprites['new_wall_horiz.png'],
						28 / 22,
						11 / 22,
						1,
					);
				}
			}

			if (x == 2) {
				for (let iy = -AREA_OFFSET; iy < AREA_SIZE - AREA_OFFSET; iy++) {
					drawTile(
						this.attributes,
						x * AREA_SIZE + AREA_SIZE - AREA_OFFSET - 1 + 19 / 22,
						y * AREA_SIZE + iy - 3 / 22,
						texPerSprites['new_wall_vert.png'],
						6 / 22,
						28 / 22,
						1,
					);
				}
			}

			if (x == -2) {
				for (let iy = -AREA_OFFSET; iy < AREA_SIZE - AREA_OFFSET; iy++) {
					drawTile(
						this.attributes,
						x * AREA_SIZE - AREA_SIZE + AREA_OFFSET + 19 / 22,
						y * AREA_SIZE + iy - 3 / 22,
						texPerSprites['new_wall_vert.png'],
						6 / 22,
						28 / 22,
						1,
					);
				}
			}
		}

		const area = areas.get(x)?.get(y);
		if (area) {
			let c = 0;
			for (let iy = -AREA_OFFSET; iy < AREA_SIZE - AREA_OFFSET; iy++) {
				for (let ix = -AREA_OFFSET; ix < AREA_SIZE - AREA_OFFSET; ix++) {
					if (x * AREA_SIZE + ix == 0 && y * AREA_SIZE + iy == 0) {
						drawTile(
							this.attributes,
							x * AREA_SIZE + ix,
							y * AREA_SIZE + iy - 3 / 22,
							texPerSprites['gates.png'],
							1,
							1,
							1,
						);
					}

					if (area.southWalls[c]) {
						drawTile(
							this.attributes,
							x * AREA_SIZE + ix - 3 / 22,
							y * AREA_SIZE + iy + 19 / 22,
							texPerSprites['new_wall_horiz.png'],
							28 / 22,
							11 / 22,
							1,
						);
					}
					if (area.eastWalls[c]) {
						drawTile(
							this.attributes,
							x * AREA_SIZE + ix + 19 / 22,
							y * AREA_SIZE + iy - 3 / 22,
							texPerSprites['new_wall_vert.png'],
							6 / 22,
							28 / 22,
							1,
						);
					}
					c++;
				}
			}
		}
	}

	render(time: number, cameraState: CameraState, state: GameViewState) {
		const GL = this.gl;
		// Compute the matrices
		var projectionMatrix = m3.projection(cameraState.renderWidth, cameraState.renderHeight);
		var scaleMatrix = m3.scaling(cameraState.renderScale, cameraState.renderScale);
		var translationMatrix = m3.translation(cameraState.renderX, cameraState.renderY);

		var viewMatrix = m3.multiply(translationMatrix, scaleMatrix);

		var matrix = m3.multiply(projectionMatrix, viewMatrix);
		const uniforms = {
			u_matrix: matrix,
			u_tex: this.textures['sheet'],
		};

		this.attributes.positions.nextIndex = 0;
		this.attributes.texs.nextIndex = 0;
		this.attributes.alphas.nextIndex = 0;

		// for (
		// 	let y = Math.floor(cameraState.y - cameraState.renderHeight / 2 - 1);
		// 	y < cameraState.y + cameraState.renderHeight / 2 + 1;
		// 	y++
		// ) {
		// 	for (
		// 		let x = Math.floor(cameraState.x - cameraState.renderWidth / 2 - 1);
		// 		x < cameraState.x + cameraState.renderWidth / 2 + 1;
		// 		x++
		// 	) {
		// 		drawTile(this.attributes, x, y, texPerSprites['ground.png'], 22 / 22, 22 / 22, 1);
		// 	}
		// }

		for (
			let y = Math.floor(cameraState.y - cameraState.height / 2 - 1);
			y < Math.ceil(cameraState.y + cameraState.height / 2 + AREA_SIZE);
			y += AREA_SIZE
		) {
			for (
				let x = Math.floor(cameraState.x - cameraState.width / 2 - 1);
				x < Math.ceil(cameraState.x + cameraState.width / 2 + AREA_SIZE);
				x += AREA_SIZE
			) {
				this.drawArea(state, areaCoord(x), areaCoord(y));
			}
		}
		// for (let y = -100; y < 100; y += 11) {
		// 	for (let x = -100; x < 100; x += 11) {
		// 		this.drawArea(areaCoord(x), areaCoord(y));
		// 	}
		// }
		// drawTileRow(this.attributes, -3 / 28, -3 / 28, texPerSprites['wall_horiz.png'], 28 / 28, 6 / 28, 128, 1);
		// drawTile(this.attributes, -6 / 28, -3 / 28, texPerSprites['wall_horiz.png'], 28 / 28, 6 / 28, 1);

		for (const character of state.otherCharacters) {
			const hx = character.position.x;
			const hy = character.position.y;
			drawTile(this.attributes, hx + 5 / 22, hy + 3 / 22, texPerSprites['hero_00.png'], 16 / 28, 16 / 28, 1);
		}

		for (const character of state.myCharacters) {
			if (state.currentCharacter && character.id !== state.currentCharacter.id) {
				const hx = character.position.x;
				const hy = character.position.y;
				drawTile(this.attributes, hx + 5 / 22, hy + 3 / 22, texPerSprites['hero_00.png'], 16 / 28, 16 / 28, 1);
			}
		}

		if (state.currentCharacter) {
			const character = state.currentCharacter;
			const hx = character.position.x;
			const hy = character.position.y;
			drawTile(this.attributes, hx + 5 / 22, hy + 3 / 22, texPerSprites['hero_00.png'], 16 / 28, 16 / 28, 1);
		}

		for (const monster of state.monsters) {
			const t = Math.min(Math.max((time - (state.offchainState?.stateChangesTimestamp || 0)) / 300, 0), 1); // TODO duration as value in GameVIewState ?
			const hx = monster.old.x + (monster.x - monster.old.x) * t;
			const hy = monster.old.y + (monster.y - monster.old.y) * t;
			// const hx = monster.x;
			// const hy = monster.y;

			if (monster.hp <= 0) {
				// drawTile(this.attributes, hx + 5 / 22, hy + 3 / 22, texPerSprites['tomb.png'], 16 / 28, 16 / 28, 1);
			} else {
				drawTile(this.attributes, hx + 5 / 22, hy + 3 / 22, texPerSprites['skeleton_sword.png'], 16 / 28, 16 / 28, 1);
			}
		}

		// we update the buffer with the new arrays
		twgl.setAttribInfoBufferFromArray(GL, this.bufferInfo.attribs!.a_position, this.attributes.positions);
		twgl.setAttribInfoBufferFromArray(GL, this.bufferInfo.attribs!.a_tex, this.attributes.texs);
		twgl.setAttribInfoBufferFromArray(GL, this.bufferInfo.attribs!.a_alpha, this.attributes.alphas);
		// we need to tell twgl the number of element to draw
		// see : https://github.com/greggman/twgl.js/issues/211
		this.bufferInfo.numElements = this.attributes.positions.nextIndex / 2;

		(window as any).attributes = this.attributes;
		(window as any).renderData = {
			xStart: Math.floor(cameraState.x - cameraState.width / 2 - 1),
			xEnd: cameraState.x + cameraState.width / 2 + 1,
			yStart: Math.floor(cameraState.y - cameraState.height / 2 - 1),
			yEnd: cameraState.y + cameraState.height / 2 + 1,
		};
		// we draw
		twgl.setBuffersAndAttributes(GL, this.programInfo, this.bufferInfo);
		twgl.setUniforms(this.programInfo, uniforms);
		twgl.drawBufferInfo(GL, this.bufferInfo, GL.TRIANGLES);
	}
}
