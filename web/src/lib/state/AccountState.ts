import type {PendingTransaction, EIP1193TransactionWithMetadata} from 'ethereum-tx-observer';
import {
	BaseAccountHandler,
	type CommitCancelMetadata,
	type OnChainAction,
	type OnChainActions,
	type RevealMetadata,
} from '$lib/account/base';
import {mainnetClient, createClient} from '$utils/fuzd';
import type {AccountInfo, SyncInfo} from '$lib/account/types';
import {fuzdURI, syncDBName, debugTools} from '$lib/config';
import {writable, type Readable, type Writable} from 'svelte/store';
import {time} from './time';
import type {ScheduleInfo} from 'fuzd-scheduler';

import type {PrivateKeyAccount} from 'viem';
import {privateKeyToAccount} from 'viem/accounts';
import {copy} from '$utils/js';
import {xyToBigIntID, type MonsterList, type StateChanges} from 'template-game-common';
import type {GameStage, GameValidStage, GameViewState} from './ViewState';
import {endInitialCamera, setInitialCamera} from '$lib/tutorial';

export type Move =
	| {
			position: {x: number; y: number};
			type: `move`;
	  }
	| {
			attackCardIndex: number;
			defenseCardIndex: number;
			type: `battle`;
	  };

export type CommitMetadata = {
	type: 'commit';
	epoch: number;
	localMoves: Move[];
	secret: `0x${string}`;
	autoReveal:
		| {
				type: 'fuzd';
				slot: string;
		  }
		| {
				type: 'local';
				account: `0x${string}`;
		  }
		| false;
};

export type EnterMetadata = {
	type: 'enter';
	// TODO more data
};

export type GameTxMetadata =
	| undefined
	| ({
			epoch: {
				hash: `0x${string}`;
				number: number;
			};
	  } & (CommitMetadata | RevealMetadata | CommitCancelMetadata | EnterMetadata));

export type Transaction = EIP1193TransactionWithMetadata<GameTxMetadata>;

export type Epoch = {number: number};

export enum TUTORIAL_STEP {
	'WELCOME' = 0,
}
export function hasCompletedTutorial(progression: number, step: TUTORIAL_STEP): boolean {
	return (progression & Math.pow(2, step)) == Math.pow(2, step);
}

export type OffchainState = {
	version: number;
	timestamp: number;
	stage: GameValidStage;
	stateChangesTimestamp: number;
	epoch?: number;
	moves: Move[];
	stateChanges: StateChanges[];

	inBattle?: {
		accepted?: boolean;
		cards: {
			choicePresented?: 'attack' | 'defense';
			attackChosen?: {cardIndex: number};
			defenseChosen?: {cardIndex: number};
			confirmed?: boolean;
		};

		resultAccepted?: boolean;
		endAccepted?: boolean;
	};
	tutorialStep: number;
};

export type AccountData = {
	onchainActions: OnChainActions<GameTxMetadata>;
	offchainState: OffchainState;
};

function fromOnChainActionToPendingTransaction(
	hash: `0x${string}`,
	onchainAction: OnChainAction<GameTxMetadata>,
): PendingTransaction {
	return {
		hash,
		request: onchainAction.tx,
		final: onchainAction.final,
		inclusion: onchainAction.inclusion,
		status: onchainAction.status,
	} as PendingTransaction;
}

function defaultData(): AccountData {
	return {
		onchainActions: {},
		offchainState: {
			stage: 'intro',
			version: 1,
			moves: [],
			stateChanges: [],
			tutorialStep: 0,
			timestamp: 0,
			stateChangesTimestamp: 0,
		},
	};
}

export type LocalAccountInfo = {
	localKey?: `0x${string}`;
};

export class AccountState extends BaseAccountHandler<AccountData, GameTxMetadata> {
	fuzdClient: ReturnType<typeof createClient> | undefined;
	localWallet: PrivateKeyAccount | undefined;

	private _offchainState: Writable<OffchainState>;
	public readonly offchainState: Readable<OffchainState>;

	private _info: Writable<LocalAccountInfo>;
	public readonly info: Readable<LocalAccountInfo>;

	constructor() {
		super(syncDBName, defaultData, fromOnChainActionToPendingTransaction);

		this._offchainState = writable(this.$data.offchainState);
		this.offchainState = {
			subscribe: this._offchainState.subscribe,
		};

		this._info = writable({});
		this.info = {
			subscribe: this._info.subscribe,
		};
	}

	get $offchainState() {
		return this.$data.offchainState;
	}

	async load(info: AccountInfo, syncInfo?: SyncInfo): Promise<void> {
		if (fuzdURI) {
			if (!info.localKey) {
				throw new Error(`no local key, FUZD requires it`);
			}
			this.fuzdClient = createClient({
				drand: mainnetClient(),
				privateKey: info.localKey,
				schedulerEndPoint: fuzdURI,
			});
		}
		if (info.localKey) {
			this.localWallet = privateKeyToAccount(info.localKey);
		}
		this._info.set({
			localKey: info.localKey,
		});
		const result = await super.load(info, syncInfo);
		this._offchainState.set(this.$data.offchainState);

		return result;
	}

	async unload() {
		this.fuzdClient = undefined;
		const result = await super.unload();
		// TODO make it an abstract notifyUnload
		this._offchainState.set(this.$data.offchainState);
		this._info.set({
			localKey: undefined,
		});
		return result;
	}

	_merge(
		localData?: AccountData | undefined,
		remoteData?: AccountData | undefined,
	): {newData: AccountData; newDataOnLocal: boolean; newDataOnRemote: boolean} {
		let newDataOnLocal = false;
		let newDataOnRemote = false;
		let newData = localData;

		if (!newData) {
			newData = defaultData();
		}

		// hmm check if valid
		if (!remoteData || !remoteData.onchainActions || !remoteData.offchainState) {
			remoteData = defaultData();
			newDataOnLocal = true;
		}

		if (
			remoteData.offchainState.version === undefined ||
			remoteData.offchainState.version < newData.offchainState.version
		) {
			remoteData.offchainState = defaultData().offchainState;
			newDataOnLocal = true;
		}

		_filterOutOldActions(remoteData.onchainActions);

		for (const key of Object.keys(newData.onchainActions)) {
			const txHash = key as `0x${string}`;

			const remoteAction = remoteData.onchainActions[txHash];
			const localAction = newData.onchainActions[txHash];
			if (remoteAction) {
				if (localAction.final && !remoteAction.final) {
					newDataOnLocal = true;
				} else if (!localAction.final && remoteAction.final) {
					newDataOnRemote = true;
					localAction.final = remoteAction.final;
					localAction.inclusion = remoteAction.inclusion;
					localAction.status = remoteAction.status;
				}

				if (remoteAction.fuzd) {
					if (remoteAction.fuzd.timestamp > (localAction.fuzd?.timestamp || 0)) {
						localAction.fuzd = remoteAction.fuzd;
						newDataOnRemote = true;
					}
				}
				if (remoteAction.revealTx && !localAction.revealTx) {
					localAction.revealTx = remoteAction.revealTx;
					newDataOnRemote = true;
				}
			}
		}

		for (const key of Object.keys(remoteData.onchainActions)) {
			const txHash = key as `0x${string}`;
			if (!newData.onchainActions[txHash]) {
				newData.onchainActions[txHash] = remoteData.onchainActions[txHash];
				newDataOnRemote = true;
			}
		}

		// if (
		// 	remoteData.offchainState.lastEpochAcknowledged &&
		// 	remoteData.offchainState.lastEpochAcknowledged > newData.offchainState.lastEpochAcknowledged
		// ) {
		// 	newData.offchainState.lastEpochAcknowledged = remoteData.offchainState.lastEpochAcknowledged;
		// 	newDataOnRemote = true;
		// } else if (
		// 	newData.offchainState.lastEpochAcknowledged &&
		// 	newData.offchainState.lastEpochAcknowledged > remoteData.offchainState.lastEpochAcknowledged
		// ) {
		// 	newDataOnLocal = true;
		// }

		if (
			// remoteData.offchainState.moves.epoch &&
			remoteData.offchainState.timestamp > newData.offchainState.timestamp
		) {
			newData.offchainState = remoteData.offchainState;
			newDataOnRemote = true;
		} else if (
			// newData.offchainState.moves.epoch &&
			newData.offchainState.timestamp > remoteData.offchainState.timestamp
		) {
			remoteData.offchainState = newData.offchainState;
			newDataOnLocal = true;
		}

		return {
			newData,
			newDataOnLocal,
			newDataOnRemote,
		};
	}

	_clean(data: AccountData): AccountData {
		const cleanedData = copy(data);
		data.offchainState.stateChangesTimestamp = 0;
		_filterOutOldActions(cleanedData.onchainActions);
		return cleanedData;
	}

	hasFUZD() {
		return !!this.fuzdClient;
	}

	async getFUZD() {
		if (!this.fuzdClient) {
			throw new Error(`no fuzd client setup`);
		}
		const remoteAccount = await this.fuzdClient.getRemoteAccount();
		const self = this;
		return {
			remoteAccount,
			scheduleExecution(
				execution: {
					slot: string;
					chainId: `0x${string}` | string;
					transaction: {
						gas: bigint;
						data: `0x${string}`;
						to: `0x${string}`;
					};
					maxFeePerGasAuthorized: bigint;
					time: number;
					expiry?: number;
					// value: `0x${string}`;
					paymentReserve?: bigint;
				},
				options?: {fakeEncrypt?: boolean},
			) {
				if (!self.fuzdClient) {
					throw new Error(`no fuzd client setup`);
				}
				return self.fuzdClient.scheduleExecution(execution, options);
			},
		};
	}

	// resetOffchainState(alsoSave: boolean = true) {
	// 	this.$data.offchainState.moves = undefined;
	// 	this.$data.offchainState.timestamp = time.now;

	// 	this.$data.offchainState.epoch = undefined;
	// 	if (alsoSave) {
	// 		this._save();
	// 	}
	// 	this._offchainState.set(this.$data.offchainState);
	// }

	resetMoves(stage: GameStage, setTutorialCamera: boolean = false) {
		if (stage === 'pending') {
			throw new Error(`invalid GameState: ${stage}`);
		}
		if (this.$data.offchainState.stateChanges.length == 0) {
			return false;
		}
		this.$data.offchainState.stage = stage;
		this.$data.offchainState.timestamp = time.now;

		this.$data.offchainState.moves.splice(0, this.$data.offchainState.moves.length);
		this.$data.offchainState.stateChanges.splice(0, this.$data.offchainState.stateChanges.length);
		this.$data.offchainState.tutorialStep = 0;
		this.$data.offchainState.inBattle = undefined;

		if (setTutorialCamera) {
			setInitialCamera();
		}

		this._save();
		this._offchainState.set(this.$data.offchainState);
		return true;
	}

	// TODO epoch
	addMove(stage: GameStage, move: Move, stateChanges: StateChanges) {
		if (stage === 'pending') {
			throw new Error(`invalid GameState: ${stage}`);
		}
		this.$data.offchainState.stage = stage;
		this.$data.offchainState.moves.push(move);
		this.$data.offchainState.stateChanges.push(stateChanges);
		this.$data.offchainState.timestamp = time.now;
		this.$data.offchainState.stateChangesTimestamp = performance.now();

		this._save();
		this._offchainState.set(this.$data.offchainState);
	}

	async endTutorial() {
		this.$data.offchainState.stage = 'intro';
		this.$data.offchainState.moves.splice(0, this.$data.offchainState.moves.length);
		this.$data.offchainState.stateChanges.splice(0, this.$data.offchainState.stateChanges.length);
		this.$data.offchainState.timestamp = time.now;
		this.$data.offchainState.tutorialStep = 1;
		this.$data.offchainState.inBattle = undefined;

		const stateChange: StateChanges = {
			battle: {
				monsterIndexPlus1: 0,
				attackCardsUsed1: 0,
				attackCardsUsed2: 0,
				defenseCardsUsed1: 0,
				defenseCardsUsed2: 0,
			},
			characterID: 1n,
			epoch: 0,
			monsters: [
				{
					x: 1,
					y: 1,
					hp: 0,
					kind: 0,
				},
				{
					x: 1,
					y: 1,
					hp: 0,
					kind: 0,
				},
				{
					x: 1,
					y: 1,
					hp: 0,
					kind: 0,
				},
				{
					x: 1,
					y: 1,
					hp: 0,
					kind: 0,
				},
				{
					x: 1,
					y: 1,
					hp: 0,
					kind: 0,
				},
			],
			newHP: 10,
			newXP: 10,
			newPosition: xyToBigIntID(0, 0),
		};
		this.$data.offchainState.moves.push({
			position: {x: 0, y: 0},
			type: 'move',
		});
		this.$data.offchainState.stateChanges.push(stateChange);

		this._save();
		this._offchainState.set(this.$data.offchainState);
		return true;
	}

	rewindMoves(stage: GameStage) {
		if (stage === 'pending') {
			throw new Error(`invalid GameState: ${stage}`);
		}
		if (this.$data.offchainState.stateChanges.length == 0) {
			return false;
		}
		this.$data.offchainState.moves.pop();
		this.$data.offchainState.timestamp = time.now;
		this.$data.offchainState.stateChanges.pop();
		this.$data.offchainState.inBattle = undefined;
		this.$data.offchainState.tutorialStep = 1;

		if (this.$data.offchainState.stateChanges.length == 0) {
			this.$data.offchainState.tutorialStep = 0;
			if (stage === 'intro') {
				setInitialCamera();
			}
		}

		this._save();
		this._offchainState.set(this.$data.offchainState);
		return true;
	}

	tutorialNext() {
		this.$data.offchainState.stage = 'intro';
		this.$data.offchainState.tutorialStep++;
		this.$data.offchainState.timestamp = time.now;

		this._save();
		this._offchainState.set(this.$data.offchainState);
	}

	acceptBattle(stage: GameStage) {
		if (stage === 'pending') {
			throw new Error(`invalid GameState: ${stage}`);
		}
		this.$data.offchainState.stage = stage;
		this.$data.offchainState.inBattle = this.$data.offchainState.inBattle || {cards: {}};
		this.$data.offchainState.inBattle.accepted = true;
		this.$data.offchainState.inBattle.endAccepted = false;
		this.$data.offchainState.timestamp = time.now;

		this._save();
		this._offchainState.set(this.$data.offchainState);
	}

	acceptBattleResult(gameView: GameViewState) {
		if (gameView.inBattle?.monster.hp == 0) {
			this.$data.offchainState.inBattle = undefined;
		} else if (this.$data.offchainState.inBattle) {
			this.$data.offchainState.inBattle.cards = {};
		}
		this.$data.offchainState.timestamp = time.now;

		this._save();
		this._offchainState.set(this.$data.offchainState);
	}

	selectAttackCard(cardIndex: number) {
		if (!this.$data.offchainState.inBattle) {
			throw new Error(`not in battle`);
		}
		this.$data.offchainState.timestamp = time.now;
		this.$data.offchainState.inBattle.cards.attackChosen = {
			cardIndex,
		};
		this.$data.offchainState.inBattle.cards.choicePresented = undefined;

		this._save();
		this._offchainState.set(this.$data.offchainState);
	}

	selectDefenseCard(cardIndex: number) {
		if (!this.$data.offchainState.inBattle) {
			throw new Error(`not in battle`);
		}
		this.$data.offchainState.timestamp = time.now;
		this.$data.offchainState.inBattle.cards.defenseChosen = {
			cardIndex,
		};
		this.$data.offchainState.inBattle.cards.choicePresented = undefined;

		this._save();
		this._offchainState.set(this.$data.offchainState);
	}

	showChoice(choice: 'attack' | 'defense') {
		if (!this.$data.offchainState.inBattle) {
			throw new Error(`not in battle`);
		}
		this.$data.offchainState.timestamp = time.now;
		this.$data.offchainState.inBattle.cards.choicePresented = choice;

		this._save();
		this._offchainState.set(this.$data.offchainState);
	}

	acceptEnd() {
		if (!this.$data.offchainState.inBattle) {
			throw new Error(`not in battle`);
		}
		this.$data.offchainState.timestamp = time.now;
		this.$data.offchainState.inBattle.endAccepted = true;
		this.$data.offchainState.inBattle.accepted = false;

		this._save();
		this._offchainState.set(this.$data.offchainState);
	}

	recordFUZD(hash: `0x${string}`, data: ScheduleInfo) {
		// TODO ensure timestamp synced ?
		const timestamp = time.now;
		const onchainAction = this.$data.onchainActions[hash];
		if (!onchainAction) {
			throw new Error(`Cannot find onchainAction with hash: ${hash}`);
		}
		if (onchainAction.tx.metadata?.type === 'commit') {
			for (const key of Object.keys(this.$data.onchainActions)) {
				const action = this.$data.onchainActions[key as `0x${string}`];
				if (
					typeof action.fuzd?.state === 'object' &&
					action.fuzd.state.account === data.account &&
					action.fuzd.state.chainId === data.chainId &&
					action.fuzd.state.slot === data.slot
				) {
					action.fuzd = {timestamp, state: 'replaced'};
				}
			}
			onchainAction.fuzd = {timestamp, state: data};

			this._save();
			this._onchainActions.set(this.$data.onchainActions);
		} else {
			throw new Error(`Action is not of type "commit"`);
		}
	}
}

function _filterOutOldActions(actions: OnChainActions<GameTxMetadata>): boolean {
	let changes = false;
	const keys = Object.keys(actions);
	let lastCommitAction: OnChainAction<CommitMetadata> | undefined;
	for (const key of keys) {
		const txHash = key as `0x${string}`;
		const action = actions[txHash];
		if (action.tx.metadata?.type === 'commit') {
			const commitAction = action as OnChainAction<CommitMetadata>;
			if (!lastCommitAction) {
				lastCommitAction = commitAction;
			} else if (lastCommitAction.tx.metadata.epoch < commitAction.tx.metadata.epoch) {
				lastCommitAction = commitAction;
			}
		}
	}

	for (const key of keys) {
		const txHash = key as `0x${string}`;
		const action = actions[txHash];
		if (!action.tx.metadata) {
			if (action.final) {
				if (action.status == 'Success') {
					delete actions[txHash];
					changes = true;
				} else if (!action.tx.timestamp || time.now - action.tx.timestamp > 7 * 24 * 3600) {
					delete actions[txHash];
					changes = true;
				}
			}
		} else {
			switch (action.tx.metadata.type) {
				case 'commit':
					const commitMetadata = action.tx.metadata;
					// if (action.status == 'Success') {
					if (lastCommitAction && lastCommitAction.tx.metadata.epoch > commitMetadata.epoch) {
						delete actions[txHash];
						changes = true;
					}
					// } else if (!action.tx.timestamp || time.now - action.tx.timestamp > 7 * 24 * 3600) {
					// 	delete actions[txHash];
					// }
					break;
				case 'reveal':
					const revealMetadata = action.tx.metadata;
					if (action.status == 'Success') {
						const commitTx = revealMetadata.commitTx;
						delete actions[commitTx];
						delete actions[txHash];
						changes = true;
					} else if (!action.tx.timestamp || time.now - action.tx.timestamp > 7 * 24 * 3600) {
						const commitTx = revealMetadata.commitTx;
						delete actions[commitTx];
						delete actions[txHash];
						changes = true;
					}
					break;
			}
		}
	}
	return changes;
}

export const accountState = new AccountState();
