import q from 'sql-concat'
import defer from 'p-defer'

import make_terminal_search from 'shared/terminal_search.js'
import escape_string from 'shared/escape_string.js'
import styles from 'shared/terminal_styles.js'
import * as message from 'shared/message_updates.js'

const wrap_with_style = (terminal_style, string) => terminal_style.open + string + terminal_style.close

export default async({ mysql }) => {
	const deferred = defer()

	const { stop } = make_terminal_search({
		async search_function(line_so_far) {
			const [ books ] = await mysql.query(
				q.select(`book.book_id, book.title, book.subtitle, location.name AS location_name`)
					.from(`book`)
					.join(`location USING(location_id)`)
					.whereLike(`title`, `%${line_so_far}%`)
					.orWhereLike(`subtitle`, `%${line_so_far}%`)
					.orderBy(`title LIKE '%${escape_string(line_so_far)}%' DESC, title ASC, subtitle ASC`)
					.build(),
			)

			return books.map(({ title, subtitle, location_name, ...rest }) => {
				let display = message.book(wrap_with_style(styles.cyan, title))

				if (subtitle) {
					display = display + `: ` + wrap_with_style(styles.dim, subtitle)
				}

				display = display + ` is at ` + message.location(wrap_with_style(styles.magenta, location_name))

				return ({
					display,
					title,
					subtitle,
					...rest,
				})
			})
		},
		selection_callback(response) {
			stop()
			deferred.resolve(response)
		},
	})

	await deferred.promise
}
