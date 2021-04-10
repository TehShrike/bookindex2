import { google_cloud_api_key } from '/Users/josh/.bookindex2-config.mjs'

import make_isbn_lookup from './google_books_isbn_lookup.js'

const isbn_lookup = make_isbn_lookup({ api_key: google_cloud_api_key })

isbn_lookup(`0310246075`).then(result => console.log(result))
