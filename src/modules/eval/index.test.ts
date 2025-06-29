import { yaraParse } from '.'

describe('[Module] Evaluator', () => {
	it('Should eval simple formula', () => {
		const value = yaraParse('1 + 3')
		value!.should.equal(4)
	})

	it('Should eval all basic operation', () => {
		yaraParse('3 + 2')!.should.equal(5)
		yaraParse('3 - 2')!.should.equal(1)
		yaraParse('3 * 2')!.should.equal(6)
		yaraParse('3 / 2')!.should.equal(1.5)
	})

	it('Should eval formula with grouping', () => {
		const value = yaraParse('(1 + 3) * (4 + 2 * 8)')
		value!.should.equal(80)
	})

	it('Should eval string', () => {
		const value = yaraParse('\'value \' + "one"')
		value!.should.equal('value one')
	})

	it('Should eval object with default value', () => {
		const value = yaraParse('foo', { foo: { eng: 40 } }, 'eng')
		value!.should.equal(40)
	})

	it('Should eval object with default value and property', () => {
		const value = yaraParse(
			'foo * bar.eng',
			{
				foo: { eng: 2, raw: 3 },
				bar: { eng: 5, raw: 7 },
			},
			'raw'
		)
		value!.should.equal(15)
	})

	it('Should eval chanining expression', () => {
		const valueTrue = yaraParse('true ? "foo" : "bar"')
		valueTrue!.should.equal('foo')
		const valueFalse = yaraParse('false ? "foo" : "bar"')
		valueFalse!.should.equal('bar')
	})

	it('Should eval logical expressions', () => {
		let value = yaraParse('10 % 2 === 0')
		value!.should.equal(true)
		value = yaraParse("10 % 2 == '0'")
		value!.should.equal(true)

		value = yaraParse('10 % 2 !== 0')
		value!.should.equal(false)

		value = yaraParse("10 % 2 != \'1\'")
		value!.should.equal(true)

		value = yaraParse('true && false')
		value!.should.equal(false)

		value = yaraParse('true || false')
		value!.should.equal(true)
	})

	it('Should solve negative number', () => {
		const context = { foo: { eng: -50, raw: 30 } }
		const value = yaraParse("foo.eng < -60 ? 'ON' : 'OFF'", context, 'eng')

		value!.should.equal('OFF')
	})
})
