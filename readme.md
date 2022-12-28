I'm making this for myself, but if you want to use it to keep track of your library, you totally can.

Work that could be done to make this more generally usable for anyone:

- allow using only one or the other of Google Books or isbndb, instead of assuming both
- configure different location barcode prefixes besides `JDD`

## Set up your database

Install MySQL 8 somewhere and manually run the queries in [schema.sql](./schema.sql).

## Where are the api keys around the internet

They go in the `.bookindex2-config.mjs` file (in your user's home directory) like so

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
