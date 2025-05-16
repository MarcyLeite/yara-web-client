describe('Mocha configuration', () => {
	const a = 1
	const b = 2
	const sum = a + b

	it('Should assert using should middleware', () => {
		sum.should.eql(3)
	})
	it('Should assert using should compare', () => {
		should.equal(sum, 3)
	})
	it('Should assert using expect', () => {
		expect(sum).to.eql(3)
	})
})
