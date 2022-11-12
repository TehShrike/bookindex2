import { Writable } from 'node:stream'

// two modes – emit lines (log output to terminal), or emit characters (swallow characters)

// collect all characters that come in
// if a newline comes in, fire an event with all characters in the buffer

// bottom line should alawys start with "﹥ " and the cursor should be right after that
// on enter, call the log() function to add it to the list, and call the callback with
// whatever was logged plus the update function

import ansi from 'sisteransi'

const count_newlines = str => Array.from(str.matchAll(/\n/g)).length

export default ({ input = process.stdin, output = process.stdout, prompt_callback }) => {
	const muted = true

	let lines_written = 0

	// const write = str => {
	// 	lines_written += count_newlines(str)
	// 	output.write(str)
	// }

	const write_newline = () => {
		lines_written++
		output.write(`\n`)
	}

	const log = (string, updater) => {
		const log_line = lines_written
		output.write(string)
		write_newline()

		return update_value => {
			output.write(ansi.cursor.save)
			output.write(ansi.cursor.prevLine(lines_written - log_line))
			output.write(ansi.erase.line)

			const to_write = updater
				? updater(update_value)
				: update_value

			output.write(ansi.cursor.left)
			output.write(to_write)
			output.write(ansi.cursor.restore)
		}
	}

	let line_so_far = ``

	const output_intercepter = new Writable({
		write(chunk, encoding, callback) {
			if (!muted) {
				output.write(chunk, encoding)
			}

			const character = chunk.toString()

			// write(`got "${character.charCodeAt(0)}"\n`)

			if (character.charCodeAt(0) === 13 || character === `\n`) {
				const line = line_so_far
				output.write(ansi.erase.line)
				output.write(ansi.cursor.left)
				const update = log(line)
				line_so_far = ``
				prompt_callback(line, update)
			} else {
				output.write(character)
				line_so_far += character
			}
			// write to the final line
			// on newline, clear the final line and call log(line)
			// on_output(chunk)
			// output.write(`received chunk ${chunk.toString()}`)
			callback()
		},
	})

	output_intercepter.setDefaultEncoding(`utf8`) // why won't you listen

	input.ref()
	input.setRawMode(true)
	input.setEncoding(`utf8`)
	input.pipe(output_intercepter)

	// const write = str => {
	// 	lines_written += count_newlines(str)
	// 	output.write(str)
	// }

	// const write_newline = () => {
	// 	lines_written++
	// 	output.write(`\n`)
	// }

	// const log = (string, updater) => {
	// 	const log_line = lines_written
	// 	write(string)
	// 	write_newline()

	// 	return update_value => {
	// 		write(ansi.cursor.save)
	// 		write(ansi.cursor.prevLine(lines_written - log_line))
	// 		write(ansi.erase.line)

	// 		const to_write = updater
	// 			? updater(update_value)
	// 			: update_value

	// 		write(to_write)
	// 		write(ansi.cursor.restore)
	// 	}
	// }

	return {
		log,
		stop: () => {
			// input.off(`data`, listener)
			input.setRawMode(false)
			input.unref()
			input.pipe(output)
		},
	}
}

