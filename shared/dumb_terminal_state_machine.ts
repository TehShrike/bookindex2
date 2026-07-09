import create_queue_terminal from '#shared/queue_terminal_callbacks.ts'
import type { Log_fn, Update_fn } from '#shared/fully_managed_terminal.ts'

export type Terminal_state_arg = {
	log: Log_fn,
	update: Update_fn,
	line: string,
}

export type Terminal_state = {
	prompt: string,
	fn: (arg: Terminal_state_arg) => Promise<Terminal_state | void> | Terminal_state | void,
}

export default async (state: Terminal_state | void): Promise<void> => {
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
