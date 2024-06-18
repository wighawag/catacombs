const portraits = ['port_war_6x.png', 'port_adv_6x.png', 'port_wiz_6x.png', 'port_bar_6x.png'];
export function portrait(characterClassIndex: number) {
	return `/images/ui/portraits/${portraits[characterClassIndex]}`;
}

const classInfos = [
	{name: 'Warrior', descriptions: ['Basic all around class']},
	{name: 'Explorer', descriptions: ['Higher coin gain from generating rooms', 'Weak attack gear']},
	{name: 'Mage', descriptions: ['More cursed gear', 'Strong defense gear', 'Higher elemental gain']},
	{name: 'Barbarian', descriptions: ['Strong attack gear', 'Weak defense gear', 'Lower elemental and coin gain']},
];
export function characterClassInfo(characterClassIndex: number) {
	return classInfos[characterClassIndex];
}
