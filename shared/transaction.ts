import type { Connection } from 'mysql2/promise'

export default async <T>(connection: Connection, fn: () => Promise<T> | T): Promise<T> => {
	await connection.query(`START TRANSACTION`)
	try {
		const result = await fn()
		await connection.query(`COMMIT`)
		return result
	} catch (err) {
		await connection.query(`ROLLBACK`)
		throw err
	}
}
