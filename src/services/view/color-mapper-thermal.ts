import { hueToHSL } from '../../utils/color-converter'
import type { GenericData } from '../connection'
import type { ColorMapperType, ColorMapperOptionsType } from './color-mapper'

/**
 * Color map thermal configuration options
 */
export type ColorMapperThermalOptions = {
	type: 'thermal'
	/**
	 * @property Minimal temperature, represented by blue
	 */
	min: number
	/**
	 * @property Minimal temperature, represented by red
	 */
	max: number
} & ColorMapperOptionsType

export type ColorMapperThermal = {
	type: 'thermal'
} & ColorMapperType

const HUE_MIN = 0,
	HUE_MAX = 240
export const createMapperThermal = ({
	min,
	max,
}: ColorMapperThermalOptions): ColorMapperThermal => {
	const getHueValue = (value: number) => {
		const rawHueValue = (HUE_MAX * (value - min)) / (max - min)
		const hueValue = rawHueValue > HUE_MAX ? HUE_MAX : rawHueValue < HUE_MIN ? HUE_MIN : rawHueValue

		return Math.abs(hueValue - HUE_MAX)
	}

	const getColor = (value: GenericData) => {
		if (typeof value !== 'number') return
		return hueToHSL(getHueValue(value))
	}

	return {
		type: 'thermal',
		scene: {
			mode: 'ghost',
		},
		getColor,
	}
}
