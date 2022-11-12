import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import parse_csv from './parse_csv.js'

const test = suite(`parse_csv`)

test(`basic test`, () => {
	const csv = `04/06/2000,08:54:13,0B,JDD0001
04/06/2000,08:54:14,0B,9781439156810\r
04/06/2000,08:54:17,0B,9780517548233\r
04/06/2000,08:54:19,0B,9780875525501\r
04/06/2000,08:54:22,0B,9781734349900
04/06/2000,08:54:25,0B,9781936365760
04/06/2000,08:54:28,0B,9781400075430
04/06/2000,08:54:30,0B,9780692090893
04/06/2000,08:54:35,0B,9781798844496
04/06/2000,08:54:36,0B,9780830837991
04/06/2000,08:54:38,0B,9780330443548
04/06/2000,08:54:42,0B,9781798967652
04/06/2000,08:54:45,0B,9781433547843
04/06/2000,08:55:50,0B,9780670829408
04/06/2000,08:56:01,0B,9780735210936
04/06/2000,08:56:08,0B,9780525576556
04/06/2000,08:56:13,0B,9781250040190
04/06/2000,08:56:17,0B,9780345537263
04/06/2000,08:56:23,0B,9780385347570
04/06/2000,08:56:31,0B,9781941114018
04/06/2000,08:56:50,0B,9781579654306
04/06/2000,08:57:00,0B,9781433557866
04/06/2000,08:57:07,01,X002AE2VAR
`
	const expected_output = [
		{ barcode: `JDD0001`, type: `location` },
		{ barcode: `9781439156810`, type: `isbn` },
		{ barcode: `9780517548233`, type: `isbn` },
		{ barcode: `9780875525501`, type: `isbn` },
		{ barcode: `9781734349900`, type: `isbn` },
		{ barcode: `9781936365760`, type: `isbn` },
		{ barcode: `9781400075430`, type: `isbn` },
		{ barcode: `9780692090893`, type: `isbn` },
		{ barcode: `9781798844496`, type: `isbn` },
		{ barcode: `9780830837991`, type: `isbn` },
		{ barcode: `9780330443548`, type: `isbn` },
		{ barcode: `9781798967652`, type: `isbn` },
		{ barcode: `9781433547843`, type: `isbn` },
		{ barcode: `9780670829408`, type: `isbn` },
		{ barcode: `9780735210936`, type: `isbn` },
		{ barcode: `9780525576556`, type: `isbn` },
		{ barcode: `9781250040190`, type: `isbn` },
		{ barcode: `9780345537263`, type: `isbn` },
		{ barcode: `9780385347570`, type: `isbn` },
		{ barcode: `9781941114018`, type: `isbn` },
		{ barcode: `9781579654306`, type: `isbn` },
		{ barcode: `9781433557866`, type: `isbn` },
		{ barcode: `X002AE2VAR`, type: null },
	]
	const output = parse_csv(csv)

	assert.equal(output, expected_output)
})

test.run()
