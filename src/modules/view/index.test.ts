import { hueToHSL } from '../../utils/color-converter'
import { DataMap } from '../consumer/buffer'
import { mockView as view, mockViewConfig as baseConfig } from '../../../tests/utils/mock-view'

describe('[Service] View', () => {
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

	it('Should create Thermal View', () => {
		view.display.should.equal(baseConfig.display)
	})

	it('Should generate component data', () => {
		const colorMap = view.components.getColorMap(dataMap)
		Object.keys(colorMap).should.have.length(2)
		colorMap.should.haveOwnProperty('0')
		colorMap.should.haveOwnProperty('1')

		if (!colorMap['0'] || !colorMap['1']) return

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

	it('Should exclude property from colormap when property not specified in datamap', () => {
		const otherDatamap = structuredClone(dataMap)
		delete otherDatamap['foo']
		const colorMap = view.components.getColorMap(otherDatamap)

		colorMap.should.not.haveOwnProperty('0')
		colorMap.should.haveOwnProperty('1')
	})
})
