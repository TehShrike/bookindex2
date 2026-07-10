import sql from 'sql-tagged-template-literal'

import get_barcode_type from '#shared/get_barcode_type.ts'
import dumb_terminal_state_machine from '#shared/dumb_terminal_state_machine.ts'
import { success, failure, location } from '#shared/message_updates.ts'

import type { Connection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import type { TerminalState } from '#shared/dumb_terminal_state_machine.ts'
import type { LocationRow } from '#shared/schema.ts'
import type { Context } from '../../index.ts'

const look_up_location = async(mysql: Connection, barcode: string): Promise<LocationRow | null> => {
	const [ [ book ] ] = await mysql.query<(LocationRow & RowDataPacket)[]>(sql`
		SELECT location_id, barcode, name
		FROM location
		WHERE barcode = ${ barcode }`,
	)

	return book || null
}

export default async({ mysql }: Context) => {
	const SCAN_LOCATION: TerminalState = {
		prompt: `Scan a new location...`,
		async fn({ log, line: location_barcode, update }) {
			if (location_barcode.length === 0) {
				return
			}

			const type = get_barcode_type(location_barcode)

			if (type !== `location`) {
				update(failure(`"${location_barcode}" doesn't look like a location barcode!`))

				return SCAN_LOCATION
			}

			update(location(location_barcode))

			const existing_location = await look_up_location(mysql, location_barcode)

			if (existing_location) {
				return UPDATE_EXISTING_LOCATION(existing_location)
			}

			return CREATE_NEW_LOCATION(location_barcode)
		},
	}

	const UPDATE_EXISTING_LOCATION = (existing_location: LocationRow): TerminalState => ({
		prompt: `That location already exists with the name ${ existing_location.name }, type in a new name for it or hit enter to leave it alone:`,
		async fn({ line: new_name, update }) {
			if (new_name) {
				await mysql.query(sql`
					UPDATE location SET name = ${ new_name } WHERE location_id = ${ existing_location.location_id }
				`)
				update(success(new_name))
			}
			return SCAN_LOCATION
		},
	})

	const CREATE_NEW_LOCATION = (location_barcode: string): TerminalState => ({
		prompt: `What name shall we give this new location?`,
		async fn({ line: name, update }) {
			if (name) {
				const [{ insertId: _location_id }] = await mysql.query<ResultSetHeader>(sql`
					INSERT INTO location (barcode, name) VALUES (${ location_barcode }, ${ name })
				`)
				update(success(name))
			}

			return SCAN_LOCATION
		},
	})

	await dumb_terminal_state_machine(SCAN_LOCATION)
}
