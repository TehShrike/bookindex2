import q from 'sql-concat'
import defer from 'p-defer'

import make_terminal_search from '#shared/terminal_search.ts'
import escape_string from '#shared/escape_string.ts'
import styles from '#shared/terminal_styles.ts'
import * as message from '#shared/message_updates.ts'

import type { RowDataPacket } from 'mysql2/promise'
import type { TerminalStyle } from '#shared/terminal_styles.ts'
import type { AuthorRow, BookRow, LocationRow } from '#shared/schema.ts'
import type { Context } from '../../index.ts'

type BookSearchRow = Omit<BookRow, 'location_id' | 'source'> & {
	location_name: LocationRow[`name`],
	author_names: AuthorRow[`name`][],
}

type BookSearchResult = Omit<BookSearchRow, 'location_name'> & {
	display: string,
}

const wrap_with_style = (terminal_style: TerminalStyle, string: string): string => terminal_style.open + string + terminal_style.close

const book_display = ({ title, subtitle }: { title: string, subtitle: string | null }): string => {
	let display = message.book(wrap_with_style(styles.cyan, title))

	if (subtitle) {
		display = display + `: ` + wrap_with_style(styles.dim, subtitle)
	}

	return display
}

const author_display = (author_name: string): string => message.author(wrap_with_style(styles.white, author_name))

export default async({ mysql }: Context) => {
	const deferred = defer<void>()

	const { stop } = make_terminal_search<BookSearchResult>({
		async search_function(line_so_far) {
			const [ books ] = await mysql.query<(BookSearchRow & RowDataPacket)[]>(
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
				const book = response
				const written_by = book.author_names.length === 0
					? `🤐 author unknown`
					: book.author_names.map(author_display).join(` and `)
				console.log(message.book(wrap_with_style(styles.cyan, book.title)) + ` was written by ` + written_by)
			}
			deferred.resolve()
		},
	})

	await deferred.promise
}
