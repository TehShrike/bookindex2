import make_fully_managed_terminal from './fully_managed_terminal.js'

const NUMBER_OF_LINES = 5

// search_function should return Array<{ display: string, result: T }>>
export default ({ search_function, selection_callback }) => {
	let update_fns = null
	let latest_type_promise = null
	const { log, stop } = make_fully_managed_terminal({
		line_prompt: `search>`,
		async type_callback(line_so_far) {
			latest_type_promise = search_function(line_so_far)
			const responses = await latest_type_promise
			const update_fns = get_update_fns()
			const blank_lines = Math.max(0, update_fns.length - responses.length)
			update_fns.forEach((update, index) => {
				const response_number = index - blank_lines
				if (response_number >= 0) {
					const { display } = responses[response_number]
					update(display)
				} else {
					update(``)
				}
			})
		},
		async prompt_callback() {
			const responses = await latest_type_promise
			selection_callback(responses[0])
		},
	})

	const get_update_fns = () => {
		if (!update_fns) {
			update_fns = new Array(NUMBER_OF_LINES).fill(null).map(() => log(``))
		}
		return update_fns
	}

	return {
		stop,
	}
}
