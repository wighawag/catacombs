import type {MergedAbis, JSProcessor, EventWithArgs} from 'ethereum-indexer-js-processor';
import {fromJSProcessor} from 'ethereum-indexer-js-processor';
import contractsInfo from './contracts';
import {bigIntIDToXY} from 'template-game-common';

export enum ControllerType {
	None = 0,
	Basic,
	Owner,
}

export type Character = {
	id: string;
	xp: number;
	hp: number;
	position: {x: number; y: number};
	controllers: {[address: `0x${string}`]: ControllerType};
	commitment?: Commitment;
	attackGear: bigint;
	defenseGear: bigint;
};

export type Commitment = {
	epoch: number;
	commitmentHash: `0x${string}`;
};

export type Data = {
	characters: {
		[id: string]: Character;
	};
	controllers: {
		[address: `0x${string}`]: string[];
	};
};

type ContractsABI = MergedAbis<typeof contractsInfo.contracts>;

const GameIndexerProcessor: JSProcessor<ContractsABI, Data> = {
	// version is automatically populated via version.cjs to let the browser knows to reindex on changes
	// only works if the changes ends up in the generated js
	version: '4', // '__VERSION_HASH__', //
	construct(): Data {
		return {
			characters: {},
			controllers: {},
		};
	},

	onEnteredTheGame(state, event) {
		const {characterID, controller: controllerAddress, newPosition} = event.args;
		const controller = controllerAddress.toLowerCase() as `0x${string}`;
		const characterIDString = characterID.toString();

		const defaultCharacrer: Character = {
			id: characterIDString,
			controllers: {},
			position: {x: 0, y: 0},
			xp: 0,
			hp: 50,
			// TODO : (2 << 98) | (2 << 91) | (2 << 84) | (1 << 77) | (2 << 70)
			attackGear: 643767809466671935455840174080n, //  (2 << 98) | (4 << 91) | (2 << 84) | (2 << 77) | (1 << 70); // <uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>
			// TODO : (2 << 98) | (2 << 91) | (0 << 84) | (0 << 77) | (1 << 70)
			defenseGear: 641311122266079177861601689600n, // (2 << 98) | (3 << 91) | (3 << 84) | (1 << 77) | (2 << 70); // <uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>,
		};
		const character: Character = state.characters[characterIDString] || defaultCharacrer;
		character.controllers[controller] = ControllerType.Owner; // TODO
		character.position = bigIntIDToXY(newPosition);

		state.characters[characterIDString] = character;
		const controlledCharacters = (state.controllers[controller] = state.controllers[controller] || []);
		controlledCharacters.push(characterIDString);

		console.log({controlledCharacters, character});

		console.log('onEnteredTheGame');
	},

	onLeftTheGame(state, event) {
		const {characterID, controller: controllerAddress, positionWhenLeaving} = event.args;
		const characterIDString = characterID.toString();
		const controller = controllerAddress.toLowerCase() as `0x${string}`;

		const characterIndex = state.controllers[controller].indexOf(characterIDString);
		state.controllers[controller].splice(characterIndex, 1);
		delete state.characters[characterIDString];
		// TODO show left status
	},

	onCommitmentMade(state, event) {
		const {characterID, commitmentHash, controller, epoch} = event.args;
		const characterIDString = characterID.toString();
		const character = state.characters[characterIDString];
		character.commitment = {
			epoch,
			commitmentHash,
		};
	},

	onMoveRevealed(state, event) {
		const {characterID, epoch, newPosition, actions} = event.args;
		const chracterIDString = characterID.toString();
		const character = state.characters[chracterIDString];
		character.position = bigIntIDToXY(newPosition);
		// show last move ?

		character.commitment = undefined;
	},
};

export const createProcessor = fromJSProcessor(() => GameIndexerProcessor);
