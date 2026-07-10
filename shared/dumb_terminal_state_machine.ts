import create_queue_terminal from '#shared/queue_terminal_callbacks.ts'
import type { LogFn, UpdateFn } from '#shared/fully_managed_terminal.ts'

export type TerminalStateArg = {
	log: LogFn,
	update: UpdateFn,
	line: string,
}

export type TerminalState = {
	prompt: string,
	fn: (arg: TerminalStateArg) => Promise<TerminalState | void> | TerminalState | void,
}

export default async (state: TerminalState | void): Promise<void> => {
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
