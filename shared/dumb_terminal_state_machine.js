import create_queue_terminal from 'shared/queue_terminal_callbacks.js'

export default async state => {
	const { log, stop, get_next } = create_queue_terminal()

	try {
		while (state) {
			log(state.prompt)
			const { line, update } = await get_next()

			state = await state.fn({ log, update, line })
		}
	} finally {
		stop()
	}
}
