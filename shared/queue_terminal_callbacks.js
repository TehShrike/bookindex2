import create_fully_managed_terminal from './fully_managed_terminal.js'
import create_deferred from 'p-defer'

export default (options = {}) => {
	const queue = []
	let next_deferred = create_deferred()

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

			return queue.shift()
		},
	}
}
