// TODO type it to allow json
export function copy<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj, bnReplacer), bnReviver);
}

export function serializeJSONWithBigInt(json: any): any {
	if (typeof json === 'bigint') {
		return json.toString();
	} else if (typeof json === 'object') {
		if (Array.isArray(json)) {
			return json.map(serializeJSONWithBigInt);
		} else {
			const keys = Object.keys(json);
			const n = {} as any;
			for (const key of keys) {
				n[key] = serializeJSONWithBigInt(json[key]);
			}
			return n;
		}
	}
	return json;
}

export function bnReviver(k: string, v: any): any {
	if (
		typeof v === 'string' &&
		(v.startsWith('-') ? !isNaN(parseInt(v.charAt(1))) : !isNaN(parseInt(v.charAt(0)))) &&
		v.charAt(v.length - 1) === 'n'
	) {
		return BigInt(v.slice(0, -1));
	}
	return v;
}
export function bnReplacer(k: string, v: any): any {
	if (typeof v === 'bigint') {
		return v.toString() + 'n';
	}
	return v;
}
