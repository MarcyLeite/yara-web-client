import type { GenericType } from '../connection/connection'
import type { Yara3DOptions } from '../scene3D/yara-3d'
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

export type ColorMapperOptions = ColorMapperThermalOptions

/**
 * ColorMapper type abstraction
 */
export type ColorMapperType = {
	/**
	 * @property type fix string for each implementaition
	 */
	type: string
	scene: Yara3DOptions
	/**
	 * Calculates color given generic type
	 * @param GenericType
	 * @returns ColorString
	 */
	getColor: (value: GenericType) => HexColor
}

export type ColorMapper = ColorMapperThermal

export const createColorMapper = (options: ColorMapperOptions): ColorMapper => {
	if (options.type === 'thermal') {
		return createMapperThermal(options)
	}

	throw new Error('Error')
}
