import make_fully_managed_terminal from './fully_managed_terminal.js'


const { stop, log } = make_fully_managed_terminal({
	prompt_callback(str, update) {
		if (str === `quit`) {
			process.exit(0)
		}
		setTimeout(() => {
			update(`✅ ${str}`)
		}, 500)
	},
})

log(`This is a log from the outside world`)

setTimeout(() => {
	log(`all done`)
	stop()
	process.exit(0)
}, 10000)
