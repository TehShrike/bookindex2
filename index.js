import mysql2 from 'mysql2/promise'
import menu from 'cli-menu'
import untildify from 'untildify'

import make_google_lookup from './stateful/google_books_isbn_lookup.js'
import make_isbndb_lookup from './stateful/isbndb_isbn_lookup.js'

import batch_stocktake from './menu_items/batch_stocktake/batch_stocktake.js'
import add_location from './menu_items/add_location/add_location.js'
import live_stocktake from './menu_items/live_stocktake/live_stocktake.js'
import search from './menu_items/search/search.js'

const make_isbn_lookup = async({ google_cloud_api_key, isbndb_rest_key }) => {
	const isbndb_lookup = make_isbndb_lookup(isbndb_rest_key)
	const google_lookup = make_google_lookup({ api_key: google_cloud_api_key })

	return async isbn => {
		const google_result = await google_lookup(isbn)

		if (google_result) {
			return google_result
		}

		return await isbndb_lookup(isbn)
	}
}


const main = async() => {
	const {
		google_cloud_api_key,
		isbndb_rest_key,
		mysql: mysql_connection_options,
		scanner_file_path,
	} = await import(untildify(`~/.bookindex2-config.mjs`))

	const isbn_lookup = await make_isbn_lookup({ google_cloud_api_key, isbndb_rest_key })

	const context = {
		mysql: await mysql2.createConnection(mysql_connection_options),
		isbn_lookup,
		scanner_file_path,
	}

	const call_with_context = fn => () => fn(context)

	return menu({
		title: `bookindex2`,
		menu_items: [{
			key: `b`,
			name: `Batch stocktake`,
			action: call_with_context(batch_stocktake),
		}, {
			key: `l`,
			name: `Add locations`,
			action: call_with_context(add_location),
		}, {
			key: `s`,
			name: `Live stocktake`,
			action: call_with_context(live_stocktake),
		}, {
			key: `q`,
			name: `Quit`,
			action: ({ back }) => back(),
		}, {
			key: `e`,
			name: `Search`,
			action: call_with_context(search),
		}],
	}).then(() => context.mysql.end())
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})
