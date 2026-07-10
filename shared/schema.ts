// Row types for the tables defined in schema.sql

export type AuthorRow = {
	author_id: number,
	name: string,
}

export type IsbnRow = {
	isbn_id: number,
	isbn: string,
}

export type LocationRow = {
	location_id: number,
	barcode: string,
	name: string,
}

export type BookRow = {
	book_id: number,
	title: string,
	subtitle: string | null,
	location_id: number | null,
	source: string | null,
}

export type BookAuthorRow = {
	book_author_id: number,
	book_id: number,
	author_id: number,
}

export type BookIsbnRow = {
	book_isbn_id: number,
	book_id: number,
	isbn_id: number,
}
