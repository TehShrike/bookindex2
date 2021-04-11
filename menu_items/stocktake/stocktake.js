import { readFile } from 'fs/promises'

import q from 'sql-concat'

import parse_csv from 'shared/parse_csv.js'
import transaction from 'shared/transaction.js'

import insert_book_from_api from './insert_book_from_api.js'

const select_book_by_isbn = isbn => q.select(`book.book_id, book.title, book.subtitle, book.location_id`)
	.from(`isbn`)
	.join(`book_isbn`, `book_isbn.isbn_id = isbn.isbn_id`)
	.join(`book`, `book.book_id = book_isbn.book_id`)
	.where(`isbn.isbn`, isbn)
	.build()

const select_location_by_barcode = barcode => q.select(`location.location_id, location.barcode, location.name`)
	.from(`location`)
	.where(`location.barcode`, barcode)
	.build()

export default async({ scanner_file_path, isbn_lookup, mysql }) =>
	transaction(mysql, async() => {
		const get_data = {
			isbn: async isbn => {
				const [ [ book_in_db ] ] = await mysql.query(select_book_by_isbn(isbn))

				console.log(`book_in_db?`, !!book_in_db)
				if (book_in_db) {
					return book_in_db
				}

				console.log(`Looking up book via API`)
				const book_from_api = await isbn_lookup(isbn)

				console.log(`book from api`, book_from_api)

				if (!book_from_api) {
					return null
				}

				const newly_created_book = await insert_book_from_api(mysql, book_from_api)

				return newly_created_book
			},
			location: async barcode => {
				const [ [ location ] ] = await mysql.query(select_location_by_barcode(barcode))

				return location || null
			},
		}

		const file_contents = await readFile(scanner_file_path, { encoding: `utf8` })
		console.log(file_contents)
		const barcodes = parse_csv(file_contents)
		console.log(barcodes)

		const scans_with_data = await Promise.all(
			barcodes.map(async scan => {
				if (!get_data[scan.type]) {
					return scan
				}
				const data = await get_data[scan.type](scan.barcode)

				return {
					...scan,
					[scan.type]: data,
				}
			}),
		)

		console.log(`This is what would ostensibly get acted on in order to update locations:`)
		console.log(scans_with_data)
	})
