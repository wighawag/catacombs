export type Monster = {
	x: number;
	y: number;
	hp: number;
	kind: number;
};

export type MonsterList = readonly [Monster, Monster, Monster, Monster, Monster];

export type Battle = {
	monsterIndexPlus1: number; // 0 means no monster
	cardsUsed1: number; // bitmap
	cardsUsed2: number; // bitmap
};

export type StateChanges = {
	characterID: bigint;
	newPosition: bigint;
	xp: number;
	epoch: number;
	hp: number;
	monsters: MonsterList;
	battle: Battle;
};

export type Action = {
	position: bigint;
	action: bigint;
};

export type Context = {
	characterID: bigint;
	priorPosition: bigint;
	controller: `0x${string}`;
	epoch: number;
	actions: Action[];
	secret: `0x${string}`;
};

export type Area = {
	x: number;
	y: number;
	eastWalls: readonly boolean[];
	southWalls: readonly boolean[];
};

export interface Game {
	areaAt(x: number, y: number): Promise<Area>;
	stepChanges(stateChanges: StateChanges, action: Action): Promise<StateChanges>;
	initialStateChanges(context: Context): Promise<StateChanges>;

	getArea(x: number, y: number): Area;
}
