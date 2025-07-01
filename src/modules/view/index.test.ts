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
			raw: 15,
		},
	}

	it('Should create Thermal View', () => {
		view.display.should.equal(baseConfig.display)
	})

	it('Should generate component data', () => {
		const stateMap = view.components.getComponentStateMap(dataMap)
		Object.keys(stateMap).should.have.length(3)
		stateMap.should.haveOwnProperty('0')
		stateMap.should.haveOwnProperty('1')

		if (!stateMap['0'].color || !stateMap['1'].color) return

		stateMap['0'].color.should.equal(hueToHSL(0))
		stateMap['1'].color.should.equal(hueToHSL(240))
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

	it('Should exclude property from state map when property not specified in datamap', () => {
		const otherDatamap = structuredClone(dataMap)
		delete otherDatamap['foo']
		const stateMap = view.components.getComponentStateMap(otherDatamap)

		stateMap.should.not.haveOwnProperty('0')
		stateMap.should.haveOwnProperty('1')
	})

	it('Should compute value and return correct value', () => {
		const stateMap = view.components.getComponentStateMap(dataMap)

		should.exist(stateMap['3'])
		if (!stateMap['3'].color) return

		stateMap['3'].color.should.equal(hueToHSL(36))
	})
})
