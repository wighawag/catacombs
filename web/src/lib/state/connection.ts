import {initConnection} from '$lib/blockchain/connection';

const connection = initConnection();

export {connection};

if (typeof window != 'undefined') {
	(window as any).connection = connection;
}
