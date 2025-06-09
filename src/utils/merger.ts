import type { GenericData } from '../modules/connection/connection'

export const mergeData = (originalData: GenericData, newData: GenericData) => {
	const copy = Object.assign({}, originalData)
	for (const [key, value] of Object.entries(newData) as [string, unknown][]) {
		if (value === null || value === undefined) continue
		copy[key] = value
	}
	return copy
}
