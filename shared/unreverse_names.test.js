import { test } from 'uvu'
import * as assert from 'uvu/assert'
import unreverse_names from './unreverse_names.js'


test(`unreverse_names`, () => {
	assert.is(unreverse_names(`McCulloch, Gretchen`), `Gretchen McCulloch`)
	assert.is(unreverse_names(`Josh Duff`), `Josh Duff`)
})

test.run()
