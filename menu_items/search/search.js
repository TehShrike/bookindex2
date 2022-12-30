import make_terminal_search from 'shared/terminal_search.js'
import q from 'sql-concat'
import sql from 'sql-tagged-template-literal'

export default ({ mysql }) => {
	const terminal_search = make_terminal_search({
		async search_function(line_so_far) {
			const [ books ] = await mysql.query(
				q.select(`book.*`)
					.from(`book`)
					.whereLike(`title`, `%${line_so_far}%`)
					.orWhereLike(`subtitle`, `%${line_so_far}%`)
					.orderBy(sql`title LIKE '%${line_so_far}%' DESC`, sql`subtitle LIKE '%${line_so_far}%' DESC`),
			)

			return books.map(({ title, subtitle, ...rest }) => ({
				display: `${title}: ${subtitle}`,
				title,
				subtitle,
				...rest,
			}))
		},
		selection_callback(response) {
			console.log(response)
		},
	})
}
