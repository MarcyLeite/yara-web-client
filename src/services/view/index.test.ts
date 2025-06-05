import { hueToHSL } from '../../utils/color-converter'
import { createView, ViewConfig } from '.'
import { DataMap } from '../buffer'

describe('[Service] View', () => {
	const baseConfig: ViewConfig = {
		display: 'Thermal View',
		mapper: {
			type: 'thermal',
			min: 0,
			max: 100,
		},
		components: [
			{
				id: '0',
				display: 'Panel #1',
				indexerList: ['foo'],
			},
			{
				id: '1',
				display: 'Panel #2',
				indexerList: ['bar'],
			},
			{
				id: '2',
				display: 'Panel #3',
				isHidden: true,
			},
		],
	}
	const view = createView(baseConfig)
	it('Should create Thermal View', () => {
		view.display.should.equal(baseConfig.display)
	})

	const dataMap: DataMap = {
		foo: {
			measurement: 'foo',
			source: '',
			status: '',
			eng: 100,
			raw: 90,
		},
		bar: {
			measurement: 'bar',
			source: '',
			status: '',
			eng: 0,
			raw: 10,
		},
	}

	it('Should generate component data', () => {
		const colorMap = view.components.getColorMap(dataMap)
		Object.keys(colorMap).should.have.length(2)
		colorMap['0'].should.equal(hueToHSL(0))
		colorMap['1'].should.equal(hueToHSL(240))
	})
	it('Should not have color for components with "isHidden: true"', () => {
		const hiddenComponentList = view.components.hidden

		hiddenComponentList.should.have.length(1)
		hiddenComponentList[0].should.equal('2')
	})

	it('Should extract datamap from object', () => {
		const exclusiveDataMap = view.components.extactFromDataMap('0', dataMap)

		should.exist(exclusiveDataMap)
		if (!exclusiveDataMap) {
			return
		}

		exclusiveDataMap.should.have.property('foo')
		exclusiveDataMap.should.not.have.property('bar')
	})
})
