import type { Connection, ResultSetHeader, FieldPacket } from 'mysql2/promise'

export const update_book_location = ({ mysql, location_id, book_id }: {
	mysql: Connection,
	location_id: number,
	book_id: number,
}): Promise<[ ResultSetHeader, FieldPacket[] ]> => mysql.query<ResultSetHeader>(`
		UPDATE book
		SET location_id = ?
		WHERE book_id = ?
	`, [
	location_id,
	book_id,
])
