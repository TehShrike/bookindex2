import mysql2 from 'mysql2/promise'
import menu from 'cli-menu'

import { google_cloud_api_key, mysql as mysql_connection_options, scanner_file_path } from '/Users/josh/.bookindex2-config.mjs'
import make_isbn_lookup from './google_books_isbn_lookup.js'

import stocktake from './menu_items/stocktake/stocktake.js'

const main = async() => {
	const context = {
		mysql: await mysql2.createConnection(mysql_connection_options),
		isbn_lookup: make_isbn_lookup({ api_key: google_cloud_api_key }),
		scanner_file_path,
	}

	const call_with_context = fn => () => fn(context)

	return menu({
		title: `bookindex2`,
		menu_items: [{
			key: `s`,
			name: `Stocktake`,
			action: call_with_context(stocktake),
		}, {
			key: `q`,
			name: `Quit`,
			action: ({ back }) => back(),
		}],
	}).then(() => context.mysql.end())
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})
