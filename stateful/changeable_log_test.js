import make_logger from './changeable_log.js'

const { log, start_prompt } = make_logger()

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const main = async() => {
	const update = log(`wat...`, value => `wat... ` + value)

	log(`ur wut`)

	const seen_lines = []
	const { update_prompt, stop } = start_prompt(line => {
		seen_lines.push({
			added: new Date(),
			line,
		})
	})

	const timeout = setInterval(() => {
		update_prompt(new Date().toLocaleTimeString() + `> `)
	}, 1000)

	await delay(1500)

	log(`eh?`)

	await delay(1500)

	update(`✅`)

	await delay(500)

	const everything_seen = stop()
	clearTimeout(timeout)

	seen_lines.forEach(({ added, line }) => {
		console.log(`At`, added.toLocaleTimeString(), `you said:`, line)
	})

	console.log(seen_lines)

	console.log(`everything seen by the listener:`, everything_seen)
}

main()
