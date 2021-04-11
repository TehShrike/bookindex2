export default async(connection, fn) => {
	await connection.query(`START TRANSACTION`)
	try {
		await fn()
		await connection.query(`COMMIT`)
	} catch (err) {
		await connection.query(`ROLLBACK`)
		throw err
	}
}
