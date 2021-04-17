const isbn_regex = /^\d{10}(\d{3})?$/
const location_regex = /^JDD\d{4}$/

export default barcode => {
	if (isbn_regex.test(barcode)) {
		return `isbn`
	} else if (location_regex.test(barcode)) {
		return `location`
	}

	return null
}
