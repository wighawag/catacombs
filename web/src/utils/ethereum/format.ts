export function shortAddress(addr: `0x${string}`): `0x${string}` {
	return `${addr.slice(0, 6)}...${addr.slice(-4)}` as `0x${string}`;
}
