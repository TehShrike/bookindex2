const isbn_regex = /^\d{10}(\d{3})?$/
const location_regex = /^JDD\d{4}$/

export type Barcode_type = `isbn` | `location`

export default (barcode: string): Barcode_type | null => {
	if (isbn_regex.test(barcode)) {
		return `isbn`
	} else if (location_regex.test(barcode)) {
		return `location`
	}

	return null
}
