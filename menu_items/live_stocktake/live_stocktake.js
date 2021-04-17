import sql from 'sql-tagged-template-literal'

import get_barcode_type from 'shared/get_barcode_type.js'
import readline from 'shared/readline.js'
import make_look_up_book from 'shared/look_up_book.js'
import { update_book_location } from 'shared/queries.js'

const possible_states = {
	no_location: `no_location`,
	at_location: `at_location`,
}

const initial_state = Object.freeze({
	book_barcodes: [],
	current_location: null,
	current_state: possible_states.no_location,
})

const back_state = Object.freeze({
	current_state: null,
})

const look_up_location = async(mysql, barcode) => {
	const [ [ book ] ] = await mysql.query(sql`
		SELECT location_id, barcode, name
		FROM location
		WHERE barcode = ${ barcode }`,
	)

	return book || null
}

const make_reducers = ({ mysql, look_up_book }) => {
	const apply_location_barcode = async location_barcode => {
		const location = await look_up_location(mysql, location_barcode)

		if (!location) {
			console.log(`No location found in the database for barcode`, location_barcode)
			// TODO: ask the user to give the location a name

			return initial_state
		}

		console.log(`Scanning books at location`, location.name)

		return {
			// book_barcodes: [],
			current_location: location,
			current_state: possible_states.at_location,
		}
	}

	return {
		no_location: async() => {
			const barcode = await readline(`Scan a location...`)

			if (barcode === ``) {
				return back_state
			}

			const barcode_type = get_barcode_type(barcode)

			if (barcode_type !== `location`) {
				return initial_state
			}

			return await apply_location_barcode(barcode)
		},
		at_location: async state => {
			const barcode = await readline(`Scan a location or book...`)

			if (barcode === ``) {
				return back_state
			}

			const barcode_type = get_barcode_type(barcode)

			if (barcode_type === `location`) {
				return apply_location_barcode(barcode)
			} else if (barcode_type === `isbn`) {
				const book = await look_up_book(barcode)

				if (!book) {
					console.log(`No book found for ISBN`, barcode)
					return state
				}

				console.log(`Scanned`, book.title)

				await update_book_location({
					mysql,
					location_id: state.current_location.location_id,
					book_id: book.book_id,
				})

				return state
			} else {
				console.log(`Unrecognized barcode:`, barcode)
				return state
			}
		},
	}
}

export default async({ isbn_lookup, mysql }) => {
	const look_up_book = make_look_up_book({ isbn_lookup, mysql })

	const reducers = make_reducers({ mysql, look_up_book })

	let state = initial_state

	while (state?.current_state) {
		const reducer = reducers[state.current_state]
		if (!reducer) {
			console.log(`No reducer for state`, state)
			return
		}
		state = await reducer(state)
	}
}
