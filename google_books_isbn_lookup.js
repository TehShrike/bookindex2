import { get } from 'httpie'

export default ({ api_key }) => isbn => {
	console.log(`https://content-books.googleapis.com/books/v1/volumes?q=isbn%3A${ isbn }&key=${ api_key }`)

	return get(
		`https://content-books.googleapis.com/books/v1/volumes?q=isbn%3A${ isbn }&key=${ api_key }`,
	).then(
		({ data }) => {
			if (data.items.length === 0) {
				return null
			}

			const {
				title,
				subtitle,
				authors,
				publishedDate,
				industryIdentifiers,
			} = data.items[0].volumeInfo

			return {
				title,
				subtitle,
				authors,
				published_date: publishedDate,
				isbns: industryIdentifiers.map(({ identifier }) => identifier),
			}
		},
	)
}
