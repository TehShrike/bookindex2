import create_fully_managed_terminal from './fully_managed_terminal.ts'
import type { LogFn, TerminalOptions, UpdateFn } from './fully_managed_terminal.ts'
import create_deferred from 'p-defer'

export type QueuedLine = {
	line: string,
	update: UpdateFn,
}

export type QueueTerminal = {
	stop: () => void,
	log: LogFn,
	get_next: () => Promise<QueuedLine>,
}

export default (options: Omit<TerminalOptions, 'prompt_callback'> = {}): QueueTerminal => {
	const queue: QueuedLine[] = []
	let next_deferred = create_deferred<void>()

	const { stop, log } = create_fully_managed_terminal({
		...options,
		prompt_callback(line, update) {
			queue.push({ line, update })
			next_deferred.resolve()
			next_deferred = create_deferred()
		},
	})

	return {
		stop,
		log,
		async get_next() {
			if (queue.length === 0) {
				await next_deferred.promise
			}

			return queue.shift()!
		},
	}
}
