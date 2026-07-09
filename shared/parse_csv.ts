import get_barcode_type from './get_barcode_type.ts'
import type { Barcode_type } from './get_barcode_type.ts'

export type Parsed_barcode = {
	barcode: string,
	type: Barcode_type | null,
}

export default (csv: string): Parsed_barcode[] => {
	const lines = csv.split(/\r?\n/g).filter(_ => _)
	const barcodes = lines.map(line => line.split(`,`).pop()!)

	return barcodes.map(barcode => ({
		barcode,
		type: get_barcode_type(barcode),
	}))
}
