import mysql2 from 'mysql2/promise'
import menu from 'cli-menu'
import untildify from 'untildify'

import make_google_lookup from './stateful/google_books_isbn_lookup.ts'
import make_isbndb_lookup from './stateful/isbndb_isbn_lookup.ts'

import batch_stocktake from './menu_items/batch_stocktake/batch_stocktake.ts'
import add_location from './menu_items/add_location/add_location.ts'
import live_stocktake from './menu_items/live_stocktake/live_stocktake.ts'
import search from './menu_items/search/search.ts'

import type { Connection, ConnectionOptions } from 'mysql2/promise'
import type { Isbn_lookup } from '#shared/look_up_book.ts'

export type Context = {
	mysql: Connection,
	isbn_lookup: Isbn_lookup,
	scanner_file_path: string,
}

type Config = {
	google_cloud_api_key: string,
	isbndb_rest_key: string,
	mysql: ConnectionOptions,
	scanner_file_path: string,
}

const make_isbn_lookup = async({ google_cloud_api_key, isbndb_rest_key }: {
	google_cloud_api_key: string,
	isbndb_rest_key: string,
}): Promise<Isbn_lookup> => {
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
	}: Config = await import(untildify(`~/.bookindex2-config.mjs`))

	const isbn_lookup = await make_isbn_lookup({ google_cloud_api_key, isbndb_rest_key })

	const context: Context = {
		mysql: await mysql2.createConnection(mysql_connection_options),
		isbn_lookup,
		scanner_file_path,
	}

	const call_with_context = (fn: (context: Context) => unknown) => () => fn(context)

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
