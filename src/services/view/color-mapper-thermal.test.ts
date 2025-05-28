import { createMapperThermal } from './color-mapper-thermal'
import { hueToHSL } from '../../utils/color-converter'

describe('[Service] Color Mapper Thermal', () => {
	it('Should value 20º be HUE 240 with min 20', () => {
		const mapper = createMapperThermal({ type: 'thermal', min: 20, max: 40 })
		const hueValue = mapper.getColor(20)
		hueValue.should.equal(hueToHSL(240))
	})
	it('Should value 20º be HUE 0 with max 20', () => {
		const mapper = createMapperThermal({ type: 'thermal', min: 10, max: 20 })
		const hueValue = mapper.getColor(20)
		hueValue.should.equal(hueToHSL(0))
	})
	it('Should value 20º be HUE 120 with min 10 and max 30', () => {
		const mapper = createMapperThermal({ type: 'thermal', min: 10, max: 30 })
		const hueValue = mapper.getColor(20)
		hueValue.should.equal(hueToHSL(120))
	})
	it('Should value 30º be 0 with max 20', () => {
		const mapper = createMapperThermal({ type: 'thermal', min: 0, max: 20 })
		const hueValue = mapper.getColor(30)
		hueValue.should.equal(hueToHSL(0))
	})
	it('Should value -10º be 240 with min 0', () => {
		const mapper = createMapperThermal({ type: 'thermal', min: 0, max: 20 })
		const hueValue = mapper.getColor(-10)
		hueValue.should.equal(hueToHSL(240))
	})
})
