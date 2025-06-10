import type { GenericData, GenericType } from '../modules/connection/connection'

export const mergeData = (originalData: GenericData, newData: GenericData) => {
	const copy = Object.assign({}, originalData)
	for (const [key, value] of Object.entries(newData) as [string, GenericType][]) {
		if (value === null || value === undefined) continue
		copy[key] = value
	}
	return copy
}
