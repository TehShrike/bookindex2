import make_fully_managed_terminal from './fully_managed_terminal.ts'
import styles from '#shared/terminal_styles.ts'
import type { Terminal_style } from '#shared/terminal_styles.ts'

const NUMBER_OF_LINES = 5

const wrap_with_style = (terminal_style: Terminal_style, string: string): string => terminal_style.open + string + terminal_style.close

export type Search_result = {
	display: string,
}

export type Search_function<T extends Search_result = Search_result> = (query: string) => Promise<T[]>

export type Selection_callback<T extends Search_result = Search_result> = (selection: T | null) => void

export default <T extends Search_result>({ search_function, selection_callback }: {
	search_function: Search_function<T>,
	selection_callback: Selection_callback<T>,
}): { stop: () => void } => {
	let latest_type_promise: Promise<T[] | null> | null = null

	const { log, stop } = make_fully_managed_terminal({
		line_prompt: `search> `,
		async type_callback(line_so_far) {
			if (line_so_far.length === 0) {
				top_update_fn(wrap_with_style(styles.yellow, wrap_with_style(styles.bold, `0`) + ` results`))
				results_update_fns.forEach(update => update(``))
				latest_type_promise = Promise.resolve(null)
				return
			}

			latest_type_promise = search_function(line_so_far)
			const responses = (await latest_type_promise)!
			const blank_lines = Math.max(0, results_update_fns.length - responses.length)
			top_update_fn(wrap_with_style(styles.yellow, wrap_with_style(styles.bold, responses.length.toString()) + ` results`))

			const relevant_responses = responses.slice(0, NUMBER_OF_LINES)
			results_update_fns.forEach((update, index) => {
				const response_number = index - blank_lines
				if (response_number >= 0) {
					const response_index = relevant_responses.length - response_number - 1
					const { display } = relevant_responses[response_index]
					update(display)
				} else {
					update(``)
				}
			})
		},
		async prompt_callback() {
			const responses = await latest_type_promise

			if (responses === null || responses.length === 0) {
				selection_callback(null)
			} else {
				selection_callback(responses[0])
			}
		},
	})

	const [ top_update_fn, ...results_update_fns ] = new Array(NUMBER_OF_LINES + 1).fill(null).map(() => log(``))

	return {
		stop,
	}
}
