import readline from 'readline'

export default async question => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,

		prompt: ``, // this option doesn't seem to do anything
		// when rl.question is called in node 14?
	})

	try {
		return await new Promise(resolve => {
			rl.question(question + `\n> `, resolve)
		})
	} finally {
		rl.close()
	}
}
