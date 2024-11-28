export type Card =
	| {
			type: 'attack';
			atk: number;
			dmg: number;
	  }
	| {
			type: 'defense';
			def: number;
			armor: number;
	  };

export type CurrentCard = {used: boolean} & Card;
