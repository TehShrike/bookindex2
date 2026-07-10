import get_barcode_type from './get_barcode_type.ts'
import type { BarcodeType } from './get_barcode_type.ts'

export type ParsedBarcode = {
	barcode: string,
	type: BarcodeType | null,
}

export default (csv: string): ParsedBarcode[] => {
	const lines = csv.split(/\r?\n/g).filter(_ => _)
	const barcodes = lines.map(line => line.split(`,`).pop()!)

	return barcodes.map(barcode => ({
		barcode,
		type: get_barcode_type(barcode),
	}))
}
