import {execute} from 'rocketh';
import '@rocketh/deploy';
import '@rocketh/deploy-proxy';
import {context} from './_context';
import {parseEther} from 'viem';

export default execute(
	context,
	async ({deployViaProxy, namedAccounts, artifacts, get}) => {
		const {deployer} = namedAccounts;

		await deployViaProxy('Characters', {
			account: deployer,
			artifact: artifacts.Characters,
			args: [0n], //[parseEther('0.004')],
		});
	},
	{tags: ['Characters', 'Characters_deploy']},
);
