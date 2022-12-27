import { Writable } from 'node:stream'

// collect all characters that come in
// if a newline comes in, fire an event with all characters in the buffer

// bottom line should alawys start with "﹥ " and the cursor should be right after that
// on enter, call the log() function to add it to the list, and call the callback with
// whatever was logged plus the update function

import ansi from 'sisteransi'

const ctrl_c = `\u0003`
const backspace_value = 127

export default ({ prompt_callback, line_prompt = `> `, input = process.stdin, output = process.stdout }) => {
	let lines_written = 0
	let current_line_so_far = ``

	const write_newline = () => {
		lines_written++
		output.write(`\n${line_prompt}${current_line_so_far}`)
	}

	const reset_line = () => {
		output.write(ansi.erase.line)
		output.write(ansi.cursor.left)
	}

	const log = (string, updater) => {
		const log_line = lines_written
		reset_line()
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

	const output_intercepter = new Writable({
		write(chunk, encoding, callback) {
			const character = chunk.toString()

			const char_code = character.charCodeAt(0)

			// output.write(`got "${char_code}"\n`)
			if (char_code === backspace_value) {
				if (current_line_so_far.length > 0) {
					current_line_so_far = current_line_so_far.slice(0, -1)
					output.write(ansi.cursor.move(-1, 0))
					output.write(` \b`)
				}
			} else if (character === ctrl_c) {
				process.exit()
			} else if (char_code === 13 || character === `\n`) {
				const line = current_line_so_far
				current_line_so_far = ``
				const update = log(line)
				prompt_callback(line, update)
			} else {
				output.write(character)
				current_line_so_far += character
			}

			callback()
		},
	})

	output_intercepter.setDefaultEncoding(`utf8`) // why won't you listen

	input.ref()
	input.setRawMode(true)
	input.setEncoding(`utf8`)
	input.pipe(output_intercepter)

	return {
		log,
		stop: () => {
			reset_line()
			input.setRawMode(false)
			input.unref()
			input.pipe(output)
		},
	}
}

