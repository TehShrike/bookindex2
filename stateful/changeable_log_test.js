import make_logger from './changeable_log.js'

const log = make_logger()

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const main = async() => {
	const update = log(`wat...`, value => `wat... ` + value)

	log(`ur wut`)

	await delay(1500)

	log(`eh?`)

	await delay(1500)

	update(`✅`)

	await delay(500)

	log.done()
}

main()
