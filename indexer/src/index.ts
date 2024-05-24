import type {MergedAbis, JSProcessor, EventWithArgs} from 'ethereum-indexer-js-processor';
import {fromJSProcessor} from 'ethereum-indexer-js-processor';
import contractsInfo from './contracts';
import {bigIntIDToXY} from 'template-game-common';

enum ControllerType {
	None = 0,
	Basic,
	Owner,
}

export type Data = {
	characters: {
		[id: string]: {
			id: string;
			position: {x: number; y: number};
			controllers: {[address: `0x${string}`]: ControllerType};
		};
	};
	commitments: {
		[id: string]: {
			epoch: number;
			commitmentHash: `0x${string}`;
		};
	};
};

type ContractsABI = MergedAbis<typeof contractsInfo.contracts>;

const GameIndexerProcessor: JSProcessor<ContractsABI, Data> = {
	// version is automatically populated via version.cjs to let the browser knows to reindex on changes
	// only works if the changes ends up in the generated js
	version: '__VERSION_HASH__', //
	construct(): Data {
		return {
			characters: {},
			commitments: {},
		};
	},

	onEnteredTheGame(state, event) {
		const {characterID, controller, newPosition} = event.args;
		const chracterIDString = characterID.toString();
		const character = state.characters[chracterIDString] || {controllers: {}, position: {x: 0, y: 0}};
		character.controllers[controller] = ControllerType.Owner; // TODO
		character.position = bigIntIDToXY(newPosition);
	},

	onLeftTheGame(state, event) {
		const {characterID, controller, positionWhenLeaving} = event.args;
		const chracterIDString = characterID.toString();
		delete state.characters[chracterIDString];
		// TODO show left status
	},

	onCommitmentMade(state, event) {
		const {characterID, commitmentHash, controller, epoch} = event.args;
		// TODO
	},

	onMoveRevealed(state, event) {
		const {characterID, controller, epoch, newPosition, actions} = event.args;
		const chracterIDString = characterID.toString();
		const character = state.characters[chracterIDString];
		character.position = bigIntIDToXY(newPosition);
		// show last move ?
	},
};

export const createProcessor = fromJSProcessor(() => GameIndexerProcessor);
