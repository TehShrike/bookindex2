import readline from 'readline'

import catchify from 'shared/catchify.js'

export default async question => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,

		prompt: ``, // this option doesn't seem to do anything
		// when rl.question is called in node 14?
	})

	const [ err, line ] = await catchify(new Promise(resolve => {
		rl.question(question + `\n> `, resolve)
	}))

	rl.close()
	process.stdin.resume()

	if (err) {
		throw err
	}

	return line
}
