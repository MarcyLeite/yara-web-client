import type { GenericType } from '../connection/connection'
import {
	createMapperKeyColor,
	type ColorMapperKeyColor,
	type ColorMapperKeyColorOptions,
} from './color-mapper-keycolor'
import {
	createMapperThermal,
	type ColorMapperThermal,
	type ColorMapperThermalOptions,
} from './color-mapper-thermal'

/**
 * Color string in Hexcode
 */
export type HexColor = string

export type ColorMapperOptionsType = {
	type: string
}

export type ColorMapperOptions = ColorMapperThermalOptions | ColorMapperKeyColorOptions

/**
 * ColorMapper type abstraction
 */
export type ColorMapperType = {
	/**
	 * @property type fix string for each implementaition
	 */
	type: string
	/**
	 * Calculates color given generic type
	 * @param GenericType
	 * @returns ColorString
	 */
	getColor: (value: GenericType) => HexColor
}

export type ColorMapper = ColorMapperThermal | ColorMapperKeyColor

export const createColorMapper = (options: ColorMapperOptions): ColorMapper => {
	if (options.type === 'thermal') {
		return createMapperThermal(options)
	}

	if (options.type === 'key-color') {
		return createMapperKeyColor(options)
	}
	throw new Error('Error')
}
