import p_throttle from 'p-throttle'
import { get } from 'httpie'

import unreverse_names from 'shared/unreverse_names.js'

const translate_response_to_expected_shape = response => {
	if (!response.book) {
		return null
	}

	const { title_long, authors, isbn, isbn13, other_isbns } = response.book

	const isbn_array = Array.isArray(other_isbns)
		? other_isbns.map(({ isbn }) => isbn)
		: []

	const isbns = Array.from(
		new Set(
			[
				isbn,
				isbn13,
				...isbn_array,
			].filter(_ => _),
		),
	)

	return {
		title: title_long,
		subtitle: null,
		authors: authors.map(unreverse_names),
		isbns,
		source: `isbndb`,
	}
}

export default api_key => {
	const throttle = p_throttle({
		limit: 1,
		interval: 1000,
		strict: true,
	})

	return throttle(async isbn => {
		if (!/^\d+$/.test(isbn)) {
			return null
		}

		try {
			const { data: response } = await get(`https://api2.isbndb.com/book/${ isbn }`, {
				headers: {
					Authorization: api_key,
				},
			})

			return translate_response_to_expected_shape(response)
		} catch (err) {
			if (err.statusCode === 404) {
				return null
			}

			throw err
		}
	})
}
