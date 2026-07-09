import { test } from 'node:test'
import assert from 'node:assert/strict'
import unreverse_names from './unreverse_names.ts'


test(`unreverse_names`, () => {
	assert.equal(unreverse_names(`McCulloch, Gretchen`), `Gretchen McCulloch`)
	assert.equal(unreverse_names(`Josh Duff`), `Josh Duff`)
})
