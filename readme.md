Right now just for myself, but could be used by other people without too much work.

Work that could be done to make this more generally usable for anyone:

- in `index.js`, load `.bookindex2-config.mjs` from the user directory instead of a hardcoded directory
- allow using only one or the other of Google Books or isbndb, instead of assuming both
- configure different location barcode prefixes besides `JD`

## Where are the api keys around the internet

They go in the `.bookindex2-config.mjs` file like so

```js
export const google_cloud_api_key = ''
export const isbndb_rest_key = ''
export const mysql = {
	user: '',
	password: '',
	database: 'bookindex2'
}
export const scanner_file_path = '/Volumes/CS3000/Scanned Barcodes/BARCODES.TXT'
```

### Google Books API

Somewhere in the Google [developers console](https://console.developers.google.com/) you can find the [Books API](https://console.developers.google.com/apis/api/books.googleapis.com/overview?project=tokyo-trilogy-157720).  There's a [Credentials](https://console.developers.google.com/apis/api/books.googleapis.com/credentials?project=tokyo-trilogy-157720) page.

### ISBNdb

[ISBNdb](https://isbndb.com/) makes it easy to get your API key as soon as you log in.

### MySQL

<https://github.com/mysqljs/mysql#connection-options>

### Scanner file path
