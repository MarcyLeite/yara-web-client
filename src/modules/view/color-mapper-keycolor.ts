import type { GenericType } from '../connection/connection'
import type { ColorMapperOptionsType, ColorMapperType } from './color-mapper'

export type ColorMapperKeyColorOptions = {
	type: 'key-color'
	map: Record<string, string>
} & ColorMapperOptionsType

export type ColorMapperKeyColor = {
	type: 'key-color'
} & ColorMapperType

export const createMapperKeyColor = (options: ColorMapperKeyColorOptions): ColorMapperKeyColor => {
	const map = structuredClone(options.map)
	const getColor = (value: GenericType) => map[value as string]

	return {
		type: 'key-color',
		getColor,
	}
}
