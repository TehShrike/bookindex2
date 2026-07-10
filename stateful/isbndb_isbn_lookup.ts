import p_throttle from 'p-throttle'
import { get } from 'httpie'

import unreverse_names from '#shared/unreverse_names.ts'

import type { BookFromApi } from '#shared/look_up_book.ts'

type IsbndbBook = {
	title_long: string,
	authors?: string[] | null,
	isbn?: string,
	isbn13?: string,
	other_isbns?: { isbn: string }[] | null,
}

type IsbndbResponse = {
	book?: IsbndbBook,
}

const translate_response_to_expected_shape = (response: IsbndbResponse): BookFromApi | null => {
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
			].filter(_ => _) as string[],
		),
	)

	return {
		title: title_long,
		subtitle: null,
		authors: Array.isArray(authors) ? authors.map(unreverse_names) : null,
		isbns,
		source: `isbndb`,
	}
}

export default (api_key: string) => {
	const throttle = p_throttle({
		limit: 1,
		interval: 1000,
		strict: true,
	})

	return throttle(async(isbn: string) => {
		if (!/^\d+$/.test(isbn)) {
			return null
		}

		try {
			const { data: response } = await get<IsbndbResponse>(`https://api2.isbndb.com/book/${ isbn }`, {
				headers: {
					Authorization: api_key,
				},
			})

			return translate_response_to_expected_shape(response)
		} catch (err) {
			if ((err as { statusCode?: number }).statusCode === 404) {
				return null
			}

			throw err
		}
	})
}
