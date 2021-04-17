import get_barcode_type from './get_barcode_type.js'

export default csv => {
	const lines = csv.split(/\r?\n/g).filter(_ => _)
	const barcodes = lines.map(line => line.split(`,`).pop())

	return barcodes.map(barcode => ({
		barcode,
		type: get_barcode_type(barcode),
	}))
}
