import {gameView, type GameViewState} from '$lib/state/ViewState';
import type {CameraState} from '../camera';
import {Textured2DProgram, type Attributes} from '../programs/Textured2D';
import * as twgl from 'twgl.js';
import * as m3 from '$utils/m3';
import sheetURL from '$data/assets/tiles.png';
import sheet from '$data/assets/tiles.json';
import {drawTile, drawTileCol, drawTileRow, drawTileX2y2, type FrameDataWithUV} from '../programs/tiles';

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

const AREA_SIZE = 11;
const AREA_OFFSET = 5;
function areaCoord(a: number): number {
	if (a >= 0) {
		return Math.floor((a + AREA_OFFSET) / AREA_SIZE);
	} else {
		return -Math.floor((-a + AREA_OFFSET) / AREA_SIZE);
	}
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

	drawArea(x: number, y: number) {
		for (let iy = 0; iy < AREA_SIZE; iy++) {
			for (let ix = 0; ix < AREA_SIZE; ix++) {
				if (iy == AREA_SIZE - 1) {
					drawTile(
						this.attributes,
						x * AREA_SIZE + ix + -6 / 28,
						y * AREA_SIZE + iy + 25 / 28,
						texPerSprites['wall_horiz.png'],
						28 / 28,
						6 / 28,
						1,
					);
				}
				if (ix == AREA_SIZE - 1) {
					drawTile(
						this.attributes,
						x * AREA_SIZE + ix + 25 / 28,
						y * AREA_SIZE + iy - 6 / 28,
						texPerSprites['wall_vert.png'],
						6 / 28,
						28 / 28,
						1,
					);
				}
			}
		}
	}

	render(cameraState: CameraState, state: GameViewState) {
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

		for (let y = cameraState.y - cameraState.height; y < cameraState.y + cameraState.height; y += 11) {
			for (let x = cameraState.x - cameraState.width; x < cameraState.x + cameraState.width; x += 11) {
				this.drawArea(areaCoord(x), areaCoord(y));
			}
		}
		// for (let y = -100; y < 100; y += 11) {
		// 	for (let x = -100; x < 100; x += 11) {
		// 		this.drawArea(areaCoord(x), areaCoord(y));
		// 	}
		// }
		// drawTileRow(this.attributes, -3 / 28, -3 / 28, texPerSprites['wall_horiz.png'], 28 / 28, 6 / 28, 128, 1);
		// drawTile(this.attributes, -6 / 28, -3 / 28, texPerSprites['wall_horiz.png'], 28 / 28, 6 / 28, 1);

		if (state.currentCharacter) {
			const char = state.characters[state.currentCharacter];
			const hx = char.position.x;
			const hy = char.position.y;
			drawTile(this.attributes, hx + 6 / 28, hy + 6 / 28, texPerSprites['hero_00.png'], 16 / 28, 16 / 28, 1);
		}

		// we update the buffer with the new arrays
		twgl.setAttribInfoBufferFromArray(GL, this.bufferInfo.attribs!.a_position, this.attributes.positions);
		twgl.setAttribInfoBufferFromArray(GL, this.bufferInfo.attribs!.a_tex, this.attributes.texs);
		twgl.setAttribInfoBufferFromArray(GL, this.bufferInfo.attribs!.a_alpha, this.attributes.alphas);
		// we need to tell twgl the number of element to draw
		// see : https://github.com/greggman/twgl.js/issues/211
		this.bufferInfo.numElements = this.attributes.positions.nextIndex / 2;

		(window as any).attributes = this.attributes;
		// we draw
		twgl.setBuffersAndAttributes(GL, this.programInfo, this.bufferInfo);
		twgl.setUniforms(this.programInfo, uniforms);
		twgl.drawBufferInfo(GL, this.bufferInfo, GL.TRIANGLES);
	}
}
