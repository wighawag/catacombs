import {execute} from 'rocketh';
import '@rocketh/deploy';
import '@rocketh/deploy-proxy';
import {context} from './_context';

export default execute(
	context,
	async ({deployViaProxy, namedAccounts, artifacts, get}) => {
		const {deployer} = namedAccounts;

		await deployViaProxy('Characters', {
			account: deployer,
			artifact: artifacts.Characters,
		});
	},
	{tags: ['Characters', 'Characters_deploy']},
);
