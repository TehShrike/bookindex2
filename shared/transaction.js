export default async(connection, fn) => {
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
