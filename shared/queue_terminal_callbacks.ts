import create_fully_managed_terminal from './fully_managed_terminal.ts'
import type { Log_fn, Terminal_options, Update_fn } from './fully_managed_terminal.ts'
import create_deferred from 'p-defer'

export type Queued_line = {
	line: string,
	update: Update_fn,
}

export type Queue_terminal = {
	stop: () => void,
	log: Log_fn,
	get_next: () => Promise<Queued_line>,
}

export default (options: Omit<Terminal_options, 'prompt_callback'> = {}): Queue_terminal => {
	const queue: Queued_line[] = []
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
