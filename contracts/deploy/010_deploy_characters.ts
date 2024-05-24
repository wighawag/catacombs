import {execute} from 'rocketh';
import '@rocketh/deploy';
import {context} from './_context';

export default execute(
	context,
	async ({deploy, namedAccounts, artifacts, get}) => {
		const {deployer} = namedAccounts;

		await deploy('Characters', {
			account: deployer,
			artifact: artifacts.Characters,
		});
	},
	{tags: ['Characters', 'Characters_deploy']},
);
