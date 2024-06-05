

export function sqlToStatements(sqlText: string) {
	return (
		sqlText
			// remove comments
			.replace(/(\/\*[^*]*\*\/)|(\/\/[^*]*)|(--[^.].*)/gm, '')
			// remove new lines
			.replace(/[\r\n]/gm, '')
			// remove extra space
			.replace(/\s+/g, ' ')
			// split in statements
			.split(';')
			.map((v) => v + ';')
			.filter((v) => v.trim() != ';')
	);
}