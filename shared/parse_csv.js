const isbn_regex = /^\d{10}(\d{3})?$/
const location_regex = /^JD\d{4}$/

const get_barcode_type = barcode => {
	if (isbn_regex.test(barcode)) {
		return `isbn`
	} else if (location_regex.test(barcode)) {
		return `location`
	}

	return null
}

export default csv => {
	const lines = csv.split(/\r?\n/g).filter(_ => _)
	const barcodes = lines.map(line => line.split(`,`).pop())

	return barcodes.map(barcode => ({
		barcode,
		type: get_barcode_type(barcode),
	}))
}
