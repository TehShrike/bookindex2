import p_throttle from 'p-throttle'
import { get } from 'httpie'

type Google_industry_identifier = {
	type: string,
	identifier: string,
}

type Google_volume_info = {
	title: string,
	subtitle?: string,
	authors?: string[],
	publishedDate?: string,
	industryIdentifiers: Google_industry_identifier[],
}

type Google_books_response = {
	items?: { volumeInfo: Google_volume_info }[] | null,
}

const isbn_identifier_types = new Set([
	`ISBN_10`,
	`ISBN_13`,
])

export default ({ api_key }: { api_key: string }) => {
	const throttle = p_throttle({
		limit: 95,
		interval: 55_000,
		strict: true,
	})

	return throttle((isbn: string) =>
		get<Google_books_response>(
			`https://content-books.googleapis.com/books/v1/volumes?q=isbn%3A${ isbn }&key=${ api_key }`,
		).then(
			({ data }) => {
				if (!Array.isArray(data.items) || data.items.length === 0) {
					return null
				}

				// console.log(`api returned`, data.items[0].volumeInfo)

				const {
					title,
					subtitle,
					authors,
					publishedDate,
					industryIdentifiers,
				} = data.items[0].volumeInfo

				const isbns_from_api = industryIdentifiers.filter(
					({ type }) => isbn_identifier_types.has(type),
				).map(
					({ identifier }) => identifier,
				)

				const known_cool_isbns = Array.from(new Set([
					...isbns_from_api,
					isbn,
				]))

				return {
					title,
					subtitle: subtitle || null,
					authors: authors || null,
					published_date: publishedDate,
					isbns: known_cool_isbns,
					source: `google books`,
				}
			},
		),
	)
}
