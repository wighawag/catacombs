import {AREA_SIZE, Action, Area, Context, StateChanges, areaCoord, type Game} from 'template-game-common';
import artifacts from 'template-game-contracts/artifacts'; // TODO use single file per artifact
import {createEVMRunner} from './utils';
import {decodeErrorResult, decodeFunctionResult, encodeFunctionData, encodePacked, keccak256} from 'viem';
import {Areas} from './Areas';

export class EVMGame implements Game {
	evmPromise: ReturnType<typeof createEVMRunner>;

	constructor() {
		this.evmPromise = createEVMRunner({
			GameUtils: {
				bytecode: artifacts.GameUtils.bytecode,
			},
			GameReveal: {
				bytecode: artifacts.GameReveal.bytecode,
			},
		});
	}

	async areaAt(x: number, y: number): Promise<Area> {
		const evm = await this.evmPromise;

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
			const error = decodeErrorResult({
				abi: artifacts.GameUtils.abi,
				data: result,
			});
			throw error;
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

	getArea(x: number, y: number): Area {
		const areaX = areaCoord(x);
		const areaY = areaCoord(y);
		const areaHash = keccak256(encodePacked(['int32', 'int32'], [areaX, areaY]));
		const areaIndex = Number(BigInt(areaHash) % 5n);
		return {...Areas[areaIndex], x: areaX, y: areaY};
	}

	async stepChanges(stateChanges: StateChanges, action: Action): Promise<StateChanges> {
		const evm = await this.evmPromise;
		const result = await evm.runContract(
			'GameReveal',
			encodeFunctionData({
				abi: artifacts.GameReveal.abi,
				functionName: 'stepChanges',
				args: [stateChanges, action, true],
			}),
		);

		try {
			return decodeFunctionResult({
				abi: artifacts.GameReveal.abi,
				functionName: 'stepChanges',
				data: result,
			});
		} catch (err) {
			const error = decodeErrorResult({
				abi: artifacts.GameReveal.abi,
				data: result,
			});
			throw error;
		}
	}

	async initialStateChanges(context: Context): Promise<StateChanges> {
		const evm = await this.evmPromise;
		const result = await evm.runContract(
			'GameReveal',
			encodeFunctionData({
				abi: artifacts.GameReveal.abi,
				functionName: 'initialStateChanges',
				args: [context],
			}),
		);

		try {
			return decodeFunctionResult({
				abi: artifacts.GameReveal.abi,
				functionName: 'initialStateChanges',
				data: result,
			});
		} catch (err) {
			const error = decodeErrorResult({
				abi: artifacts.GameReveal.abi,
				data: result,
			});
			throw error;
		}
	}
}
