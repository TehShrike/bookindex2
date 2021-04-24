import ansi from 'sisteransi'

const count_newlines = str => Array.from(str.matchAll(/\n/g)).length

export default (input = process.stdin, output = process.stdout) => {
	console.log(`process.stdin.isPaused()`, process.stdin.isPaused())
	let lines_written = 0

	const write = str => {
		lines_written += count_newlines(str)
		output.write(str)
	}

	const write_newline = () => {
		lines_written++
		output.write(`\n`)
	}

	const input_listener = data => {
		lines_written += count_newlines(data.toString())
	}
	input.on(`data`, input_listener)

	const log_function = (string, updater) => {
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

	log_function.done = () => {
		input.off(`data`, input_listener)
		input.unref()
	}

	return log_function
}
