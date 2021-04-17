import sql from 'sql-tagged-template-literal'

import get_barcode_type from 'shared/get_barcode_type.js'
import readline from 'shared/readline.js'

const look_up_location = async(mysql, barcode) => {
	const [ [ book ] ] = await mysql.query(sql`
		SELECT location_id, barcode, name
		FROM location
		WHERE barcode = ${ barcode }`,
	)

	return book || null
}

const scan_until_empty_line = async(question, fn) => {
	do {
		const scanned = await readline(question)

		if (!scanned) {
			return
		}

		await fn(scanned)
	} while (true)
}

export default async({ mysql }) => {
	await scan_until_empty_line(`Scan a new location...`, async barcode => {
		const type = get_barcode_type(barcode)
		if (type !== `location`) {
			console.log(barcode, `doesn't look like a location barcode!`)
			return
		}

		const existing_location = await look_up_location(mysql, barcode)

		if (existing_location) {
			const new_name = await readline(`That location already exists with the name ${ existing_location.name }, type in a new name for it or hit enter to leave it alone:`)
			if (new_name) {
				await mysql.query(sql`
					UPDATE location SET name = ${ new_name } WHERE location_id = ${ existing_location.location_id }
				`)
			}
			return
		}

		const name = await readline(`What name shall we give this location?`)
		const [{ insertId: location_id }] = await mysql.query(sql`
			INSERT INTO location (barcode, name) VALUES (${ barcode }, ${ name })
		`)
		console.log(`Saved location_id`, location_id)
	})
}
