export const update_book_location = ({ mysql, location_id, book_id }) => mysql.query(`
		UPDATE book
		SET location_id = ?
		WHERE book_id = ?
	`, [
	location_id,
	book_id,
])
