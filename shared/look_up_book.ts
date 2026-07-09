import q from 'sql-concat'
import sql from 'sql-tagged-template-literal'

import transaction from '#shared/transaction.ts'

import type { Connection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'

export type Book_row = {
	book_id: number,
	title: string,
	subtitle: string | null,
	location_id: number | null,
}

export type Book_from_api = {
	title: string,
	subtitle: string | null,
	authors: string[] | null,
	isbns: string[],
	source: string,
}

export type Isbn_lookup = (isbn: string) => Promise<Book_from_api | null>

const select_book_by_isbn = (isbn: string) => q.select(`book.book_id, book.title, book.subtitle, book.location_id`)
	.from(`isbn`)
	.join(`book_isbn`, `book_isbn.isbn_id = isbn.isbn_id`)
	.join(`book`, `book.book_id = book_isbn.book_id`)
	.where(`isbn.isbn`, isbn)
	.build()

export default ({ isbn_lookup, mysql }: { isbn_lookup: Isbn_lookup, mysql: Connection }) => async (isbn: string): Promise<Book_row | null> => {
	const [ [ book_in_db ] ] = await mysql.query<(Book_row & RowDataPacket)[]>(select_book_by_isbn(isbn))

	if (book_in_db) {
		return book_in_db
	}

	const book_from_api = await isbn_lookup(isbn)

	if (!book_from_api) {
		return null
	}

	const newly_created_book = await insert_book_from_api(mysql, book_from_api)

	return newly_created_book
}

const insert_single_column = (table: string, column: string, values: string[]) => `
	INSERT IGNORE INTO ${ table } (${ column }) VALUES
		${ values.map(value => sql`(${ value })`).join(`, `) }
`

const insert_book_from_api = async (mysql: Connection, book_from_api: Book_from_api): Promise<Book_row> => {
	const { title, subtitle, authors, isbns, source } = book_from_api

	return await transaction(mysql, async () => {
		await Promise.all([
			authors && mysql.query(insert_single_column(`author`, `name`, authors)),
			mysql.query(insert_single_column(`isbn`, `isbn`, isbns)),
		])

		const [{ insertId: book_id }] = await mysql.query<ResultSetHeader>(
			`INSERT INTO book SET ?`, [{ title, subtitle, source }],
		)

		const book_author_insert_query = sql`
			INSERT INTO book_author (book_id, author_id)
			SELECT ${ book_id }, author_id
			FROM author
			WHERE name IN(${ authors })
		`

		const book_isbn_insert_query = sql`
			INSERT INTO book_isbn (book_id, isbn_id)
			SELECT ${ book_id }, isbn_id
			FROM isbn
			WHERE isbn IN(${ isbns })
		`
		await Promise.all([
			mysql.query(book_author_insert_query),
			mysql.query(book_isbn_insert_query),
		])

		return {
			book_id,
			title,
			subtitle,
			location_id: null,
		}
	})
}
