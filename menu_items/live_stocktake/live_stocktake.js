import sql from 'sql-tagged-template-literal'

import get_barcode_type from 'shared/get_barcode_type.js'
import make_look_up_book from 'shared/look_up_book.js'
import { update_book_location } from 'shared/queries.js'
import dumb_terminal_state_machine from 'shared/dumb_terminal_state_machine.js'
import * as message from 'shared/message_updates.js'

const look_up_location = async(mysql, barcode) => {
	const [ [ book ] ] = await mysql.query(sql`
		SELECT location_id, barcode, name
		FROM location
		WHERE barcode = ${ barcode }`,
	)

	return book || null
}

export default async({ isbn_lookup, mysql }) => {
	const look_up_book = make_look_up_book({ isbn_lookup, mysql })

	let current_location = null

	const apply_location_barcode = async({ log, update, location_barcode }) => {
		const location = await look_up_location(mysql, location_barcode)

		if (location) {
			log(`Scanning books at location "${location.name}"...`)
			update(message.success(message.location(location.name)))

			current_location = location

			return AT_LOCATION
		} else {
			update(message.failure(location_barcode))
			log(`No location found in the database for barcode`, location_barcode)
			// TODO: ask the user to give the location a name
			return NO_LOCATION
		}
	}

	const NO_LOCATION = {
		prompt: `Scan a location:`,
		async fn({ log, update, line: barcode }) {
			if (barcode === ``) {
				return
			}
			const barcode_type = get_barcode_type(barcode)

			if (barcode_type !== `location`) {
				return NO_LOCATION
			}

			return await apply_location_barcode({ log, update, location_barcode: barcode })
		},
	}

	const AT_LOCATION = {
		prompt: `Scan a location or book...`,
		async fn({ log, update, line: barcode }) {
			if (barcode === ``) {
				return
			}
			const barcode_type = get_barcode_type(barcode)

			if (barcode_type === `location`) {
				return apply_location_barcode({ log, update, location_barcode: barcode })
			} else if (barcode_type === `isbn`) {
				const book = await look_up_book(barcode)

				if (!book) {
					update(message.failure(`No book found for ISBN "${barcode}"`))
					return AT_LOCATION
				}

				update(book.title)

				await update_book_location({
					mysql,
					location_id: current_location.location_id,
					book_id: book.book_id,
				})

				update(message.success(message.book(book.title)))

				return AT_LOCATION
			} else {
				update(message.failure(`Unrecognized barcode "${barcode}"`))
				return AT_LOCATION
			}
		},
	}

	await dumb_terminal_state_machine(NO_LOCATION)
}
