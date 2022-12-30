import q from 'sql-concat'
import defer from 'p-defer'

import make_terminal_search from 'shared/terminal_search.js'
import escape_string from 'shared/escape_string.js'
import styles from 'shared/terminal_styles.js'
import * as message from 'shared/message_updates.js'

const wrap_with_style = (terminal_style, string) => terminal_style.open + string + terminal_style.close

const book_display = ({ title, subtitle }) => {
	let display = message.book(wrap_with_style(styles.cyan, title))

	if (subtitle) {
		display = display + `: ` + wrap_with_style(styles.dim, subtitle)
	}

	return display
}

const author_display = author_name => message.author(wrap_with_style(styles.white, author_name))

export default async({ mysql }) => {
	const deferred = defer()

	const { stop } = make_terminal_search({
		async search_function(line_so_far) {
			const [ books ] = await mysql.query(
				q.select(
					`book.book_id, book.title, book.subtitle`,
					`location.name AS location_name`,
					`IF(COUNT(author.name) > 0, JSON_ARRAYAGG(author.name), JSON_ARRAY()) AS author_names`,
				)
					.from(`book`)
					.join(`location USING(location_id)`)
					.leftJoin(`book_author USING(book_id)`)
					.leftJoin(`author USING(author_id)`)
					.whereLike(`book.title`, `%${line_so_far}%`)
					.orWhereLike(`book.subtitle`, `%${line_so_far}%`)
					.orWhereLike(`author.name`, `%${line_so_far}%`)
					.groupBy(`book.book_id`)
					.orderBy(`title LIKE '%${escape_string(line_so_far)}%' DESC, title ASC, subtitle ASC`)
					.build(),
			)

			return books.map(({ title, subtitle, location_name, ...rest }) => {
				const display = book_display({ title, subtitle }) + ` is at ` + message.location(wrap_with_style(styles.magenta, location_name))

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
			if (response) {
				const written_by = response.author_names.length === 0
					? `🤐`
					: response.author_names.map(author_display).join(` and `)
				console.log(message.book(wrap_with_style(styles.cyan, response.title)) + ` was written by ` + written_by)
			}
			deferred.resolve()
		},
	})

	await deferred.promise
}
