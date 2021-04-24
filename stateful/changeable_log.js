import ansi from 'sisteransi'

const count_newlines = str => Array.from(str.matchAll(/\n/g)).length

// collect all characters that come in
// if a newline comes in, fire an event with all characters in the buffer

const start_line_emitter = (input, write, cb) => {
	let buffer = ``

	const listener = data => {
		const key = data.toString()

		write(key)

		if (key === `\n`) {
			try {
				cb(buffer)
			} finally {
				buffer = ``
			}
		} else {
			buffer += key
		}
	}

	input.ref()
	input.setRawMode(true)
	input.on(`data`, listener)

	return () => {
		input.off(`data`, listener)
		input.setRawMode(false)
		input.unref()
	}
}

const start_prompt = ({ input, log, write, prompt_listener_cb, initial_prompt = `> ` }) => {
	let current_prompt_string = initial_prompt
	let update_last_prompt = log(current_prompt_string)

	const log_prompt = () => {
		update_last_prompt = log(current_prompt_string)
	}

	const stop_line_listener = start_line_emitter(input, write, line => {
		try {
			prompt_listener_cb(line)
		} finally {
			log_prompt()
		}
	})

	return {
		update_prompt(new_prompt) {
			current_prompt_string = new_prompt
			update_last_prompt(new_prompt)
		},
		stop() {
			stop_line_listener()
		},
	}
}

export default (input = process.stdin, output = process.stdout) => {
	let lines_written = 0

	const write = str => {
		lines_written += count_newlines(str)
		output.write(str)
	}

	const write_newline = () => {
		lines_written++
		output.write(`\n`)
	}

	const log = (string, updater) => {
		const log_line = lines_written
		write(string)
		write_newline()

		return update_value => {
			write(ansi.cursor.save)
			write(ansi.cursor.prevLine(lines_written - log_line))
			write(ansi.erase.line)

			const to_write = updater
				? updater(update_value)
				: update_value

			write(to_write)
			write(ansi.cursor.restore)
		}
	}

	return {
		log,
		start_prompt(prompt_listener) {
			return start_prompt({
				input,
				log,
				write,
				prompt_listener_cb: line => {
					lines_written++
					prompt_listener(line)
				},
			})
		},
	}
}
