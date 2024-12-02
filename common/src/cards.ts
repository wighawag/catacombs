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

// <uint3 numCards><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value><uint7 bonus><uint7 value>
export function fromBigIntToCards(type: 'attack' | 'defense', gear: bigint): Card[] {
	const cards: Card[] = [];
	const numCards = gear >> 98n;
	for (let i = 0n; i < numCards; i++) {
		const offset = 91n - 7n * i * 2n;
		const bonus = Number((gear >> offset) & 0b1111111n);
		const value = Number((gear >> (offset - 7n)) & 0b1111111n);
		cards.push(
			type == 'attack'
				? {
						type,
						atk: bonus,
						dmg: value,
					}
				: {
						type,
						def: bonus,
						armor: value,
					},
		);
	}
	return cards;
}
