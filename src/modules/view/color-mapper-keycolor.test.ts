import { createMapperKeyColor } from './color-mapper-keycolor'

describe('[View] Color Mapper KeyColor', () => {
	const config = {
		type: 'key-color' as const,
		map: {
			hot: '#ff0000',
			cold: '#0000ff',
			warm: '#00ff00',
			'foo-bar': '#ffffff',
		},
	}

	it('Should color correctly', () => {
		const mapper = createMapperKeyColor(config)
		mapper.getColor('hot').should.equal('#ff0000')
		mapper.getColor('cold').should.equal('#0000ff')
		mapper.getColor('warm').should.equal('#00ff00')
		mapper.getColor('foo-bar').should.equal('#ffffff')
	})
})
