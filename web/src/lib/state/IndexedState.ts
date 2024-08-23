import {initContractState} from '$lib/blockchain/contractState';
import {connection} from './connection';

export const contractState = initContractState(connection);

if (typeof window != 'undefined') {
	(window as any).contractState = contractState;
}
