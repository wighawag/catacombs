import {execute} from 'rocketh';
import '@rocketh/deploy';
import {context} from './_context';

export default execute(
	context,
	async ({deploy, namedAccounts, artifacts}) => {
		const {deployer} = namedAccounts;

		const config = {
			startTime: 0n,
			commitPhaseDuration: 23n * 60n * 60n,
			revealPhaseDuration: 1n * 60n * 60n,
		};

		const GameCommit = await deploy('GameCommit', {
			account: deployer,
			artifact: artifacts.GameCommit,
		});

		const GameController = await deploy('GameController', {
			account: deployer,
			artifact: artifacts.GameController,
		});

		const GameReveal = await deploy('GameReveal', {
			account: deployer,
			artifact: artifacts.GameReveal,
		});

		await deploy('Game', {
			account: deployer,
			artifact: artifacts.GameRouter,
			args: [
				{
					commitRoute: GameCommit.address,
					controllerRoute: GameController.address,
					revealRoute: GameReveal.address,
				},
				config,
			],
			
		}, {
			linkedData: {
				...config
			}
		});
	},
	{tags: ['Game', 'Game_deploy']},
);
