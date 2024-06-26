const portraits = ['port_war_6x.png', 'port_adv_6x.png', 'port_wiz_6x.png', 'port_bar_6x.png'];
export function portrait(characterClassIndex: number) {
	return `/images/ui/portraits/${portraits[characterClassIndex]}`;
}

const classInfos = [
	{name: 'Warrior', descriptions: ['Basic all around class']},
	{name: 'Explorer', descriptions: ['Higher coin gain', 'Weak attack gear']},
	{name: 'Mage', descriptions: ['More cursed gear', 'Strong defense gear']},
	{name: 'Barbarian', descriptions: ['Strong attack gear', 'Weak defense gear', 'Lower coin gain']},
];
export function characterClassInfo(characterClassIndex: number) {
	return classInfos[characterClassIndex];
}
