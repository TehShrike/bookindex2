export default name => {
	const match = name.match(/^([^,]+),\s*(.+)$/)

	if (!match) {
		return name
	}

	const [ , last, first ] = match

	return `${ first } ${ last }`
}
