import {execute} from 'rocketh';
import '@rocketh/deploy';
import {context} from './_context';

export default execute(
	context,
	async ({deploy, namedAccounts, artifacts, get}) => {
		const {deployer} = namedAccounts;

		const Characters = await get('Characters');

		const config = {
			startTime: 0n,
			commitPhaseDuration: 23n * 60n * 60n,
			revealPhaseDuration: 1n * 60n * 60n,
			characters: Characters.address,
		};

		const GameEnter = await deploy('GameEnter', {
			account: deployer,
			artifact: artifacts.GameEnter,
		});

		const GameLeave = await deploy('GameLeave', {
			account: deployer,
			artifact: artifacts.GameLeave,
		});

		const GameCommit = await deploy('GameCommit', {
			account: deployer,
			artifact: artifacts.GameCommit,
		});

		const GameReveal = await deploy('GameReveal', {
			account: deployer,
			artifact: artifacts.GameReveal,
		});

		await deploy(
			'Game',
			{
				account: deployer,
				artifact: artifacts.GameRouter,
				args: [
					{
						enterRoute: GameEnter.address,
						leaveRoute: GameLeave.address,
						commitRoute: GameCommit.address,
						revealRoute: GameReveal.address,
					},
					config,
				],
			},
			{
				linkedData: {
					...config,
				},
			},
		);
	},
	{tags: ['Game', 'Game_deploy'], dependencies: ['Characters_deploy']},
);
