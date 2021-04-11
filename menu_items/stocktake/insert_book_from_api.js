import sql from 'sql-tagged-template-literal'

const insert_single_column = (table, column, values) => `
	INSERT IGNORE INTO ${ table } (${ column }) VALUES
		${ values.map(value => sql`(${ value })`).join(`, `) }
`

export default async(mysql, book_from_api) => {
	const { title, subtitle, authors, isbns } = book_from_api

	await Promise.all([
		mysql.query(insert_single_column(`author`, `name`, authors)),
		mysql.query(insert_single_column(`isbn`, `isbn`, isbns)),
	])

	const [{ insertId: book_id }] = await mysql.query(
		`INSERT INTO book SET ?`, [{ title, subtitle }],
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
}
