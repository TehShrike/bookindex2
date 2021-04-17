import { readFile } from 'fs/promises'

import q from 'sql-concat'

import parse_csv from 'shared/parse_csv.js'
import make_look_up_book from 'shared/look_up_book.js'

const select_location_by_barcode = barcode => q.select(`location.location_id, location.barcode, location.name`)
	.from(`location`)
	.where(`location.barcode`, barcode)
	.build()

export default async({ scanner_file_path, isbn_lookup, mysql }) => {
	const look_up_book = make_look_up_book({ isbn_lookup, mysql })

	const get_data = {
		isbn: look_up_book,
		location: async barcode => {
			const [ [ location ] ] = await mysql.query(select_location_by_barcode(barcode))

			return location || null
		},
	}

	const file_contents = await readFile(scanner_file_path, { encoding: `utf8` })

	const barcodes = parse_csv(file_contents)

	const scans_with_data = await Promise.all(
		barcodes.map(async scan => {
			if (!get_data[scan.type]) {
				return scan
			}
			const data = await get_data[scan.type](scan.barcode)

			return {
				...scan,
				data,
			}
		}),
	)

	let current_location_id = null
	await Promise.all(
		scans_with_data.map(async scan => {
			if (scan.type === `location`) {
				const location = scan.data
				console.log(`Scanned location`, location.name)
				current_location_id = location.location_id
			} else if (current_location_id && scan.type === `isbn` && scan.data) {
				const book = scan.data
				console.log(`Assigning location to`, book.title)

				mysql.query(`
					UPDATE book
					SET location_id = ?
					WHERE book_id = ?
				`, [
					current_location_id,
					book.book_id,
				])
			} else {
				console.log(`Ignoring scan`, scan)
			}
		}),
	)
}
