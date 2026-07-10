// Cribbed from https://github.com/mysqljs/sqlstring/blob/cd528556b4b6bcf300c3db515026935dedf7cfa1/lib/SqlString.js
// but without adding quotation marks to the result

const CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g // eslint-disable-line no-control-regex
const CHARS_ESCAPE_MAP: Record<string, string> = {
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

export default (val: string): string => {
	let chunk_index = 0
	let escaped_val = ``
	let match

	CHARS_GLOBAL_REGEXP.lastIndex = 0

	while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
		escaped_val += val.slice(chunk_index, match.index) + CHARS_ESCAPE_MAP[match[0]]
		chunk_index = CHARS_GLOBAL_REGEXP.lastIndex
	}

	if (chunk_index === 0) {
		// Nothing was escaped
		return val
	}

	if (chunk_index < val.length) {
		return escaped_val + val.slice(chunk_index)
	}

	return escaped_val
}
