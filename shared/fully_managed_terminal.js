import { Writable } from 'node:stream'
import { Buffer } from 'node:buffer'

// collect all characters that come in
// if a newline comes in, fire an event with all characters in the buffer

// bottom line should alawys start with "﹥ " and the cursor should be right after that
// on enter, call the log() function to add it to the list, and call the callback with
// whatever was logged plus the update function

import ansi from 'sisteransi'

const ctrl_c = `\u0003`
const backspace_value = 127

const up_arrow = Buffer.from([ 27, 91, 65 ])
const down_arrow = Buffer.from([ 27, 91, 66 ])
const right_arrow = Buffer.from([ 27, 91, 67 ])
const left_arrow = Buffer.from([ 27, 91, 68 ])

export default ({ type_callback = null, prompt_callback, line_prompt = `> `, input = process.stdin, output = process.stdout }) => {
	let lines_written = 0
	let probable_cursor_position = 0
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

			// output.write(`buffer values: "${Array.from(chunk.values()).join(`, `)}"\n`)
			const up_or_down_arrow_key = down_arrow.equals(chunk) || up_arrow.equals(chunk)

			const trying_to_move_too_far_left = left_arrow.equals(chunk) && probable_cursor_position <= 0
			const trying_to_move_too_far_right = right_arrow.equals(chunk) && probable_cursor_position >= current_line_so_far.length

			if (up_or_down_arrow_key || trying_to_move_too_far_left || trying_to_move_too_far_right) {
				// Do nothing
			} else if (char_code === backspace_value) {
				// Swallow backspace keypresses by default
				const may_backspace = current_line_so_far.length > 0

				if (may_backspace) {
					probable_cursor_position -= 1
					current_line_so_far = current_line_so_far.slice(0, -1)
					output.write(ansi.cursor.move(-1, 0))
					output.write(` \b`)
				}
			} else if (character === ctrl_c) {
				process.exit()
			} else if (char_code === 13 || character === `\n`) {
				probable_cursor_position = 0
				const line = current_line_so_far
				current_line_so_far = ``
				const update = log(line)
				prompt_callback(line, update)
			} else {
				output.write(character)

				if (left_arrow.equals(chunk)) {
					probable_cursor_position -= 1
				} else if (right_arrow.equals(chunk)) {
					probable_cursor_position += 1
				} else {
					current_line_so_far += character
					probable_cursor_position += character.length
					type_callback && type_callback(current_line_so_far)
				}
			}

			callback()
		},
	})

	output_intercepter.setDefaultEncoding(`utf8`) // why won't you listen

	input.ref()
	input.setRawMode(true)
	input.setEncoding(`utf8`)
	input.unpipe(output)
	input.pipe(output_intercepter)

	return {
		log,
		stop: () => {
			reset_line()
			input.unpipe(output_intercepter)
			output_intercepter.destroy()
			input.setRawMode(false)
			input.unref()
			input.pipe(output)
		},
	}
}

