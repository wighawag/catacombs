export type Monster = {
	x: number;
	y: number;
	life: number;
};

export type StateChanges = {
	characterID: bigint;
	newPosition: bigint;
	epoch: number;
	monsters: readonly [Monster, Monster, Monster, Monster, Monster];
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
	getArea(x: number, y: number): Area;
}
