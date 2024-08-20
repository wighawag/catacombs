export type Monster = {
	x: number;
	y: number;
	hp: number;
	kind: number;
};

export type MonsterList = readonly [Monster, Monster, Monster, Monster, Monster];

export type Battle = {
	monsterIndexPlus1: number; // 0 means no monster
	attackCardsUsed1: number; // bitmap
	attackCardsUsed2: number; // bitmap
	defenseCardsUsed1: number; // bitmap
	defenseCardsUsed2: number; // bitmap
};

export type StateChanges = {
	characterID: bigint;
	newPosition: bigint;
	newXP: number;
	epoch: number;
	newHP: number;
	monsters: MonsterList;
	battle: Battle;
};

export type Action = bigint;

export type Context = {
	characterID: bigint;
	priorPosition: bigint;
	controller: `0x${string}`;
	epoch: number;
	actions: Action[];
	secret: `0x${string}`;

	priorGold: bigint;
	priorHP: number;
	priorXP: number;
	attackGear: bigint;
	defenseGear: bigint;
	accessory1: bigint;
	accessory2: bigint;
};

export type Area = {
	x: number;
	y: number;
	eastWalls: readonly boolean[];
	southWalls: readonly boolean[];
};

export interface Game {
	areaAt(x: number, y: number): Promise<Area>;
	stepChanges(stateChanges: StateChanges, context: Context, action: Action): Promise<StateChanges>;
	initialStateChanges(context: Context): Promise<StateChanges>;

	getArea(x: number, y: number): Area;
}
