// Cribbed from https://github.com/mysqljs/sqlstring/blob/cd528556b4b6bcf300c3db515026935dedf7cfa1/lib/SqlString.js
// but without adding quotation marks to the result

const CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g // eslint-disable-line no-control-regex
const CHARS_ESCAPE_MAP = {
	'\0': `\\0`,
	'\b': `\\b`,
	'\t': `\\t`,
	'\n': `\\n`,
	'\r': `\\r`,
	'\x1a': `\\Z`,
	'"': `\\"`,
	'\'': `\\'`,
	'\\': `\\\\`,
}

export default val => {
	let chunkIndex = 0
	let escapedVal = ``
	let match

	CHARS_GLOBAL_REGEXP.lastIndex = 0

	while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
		escapedVal += val.slice(chunkIndex, match.index) + CHARS_ESCAPE_MAP[match[0]]
		chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex
	}

	if (chunkIndex === 0) {
		// Nothing was escaped
		return val
	}

	if (chunkIndex < val.length) {
		return escapedVal + val.slice(chunkIndex)
	}

	return escapedVal
}
