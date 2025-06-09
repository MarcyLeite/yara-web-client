import { createBuffer, type DataMap } from './buffer'
import type { BufferStrategy } from './buffer-strategy'
import type { Buffer } from './buffer'
import type { Optional } from '@/utils/types'

/**
 * Abstraction of a Consumer that will create a buffer and updated based on time.
 */
export type Consumer = {
	/**
	 * get dataMap from all last values on given moment.
	 * @param moment get values until this Date
	 * @returns DataMap
	 */
	getSnapshot: (moment: Date) => DataMap

	/**
	 * get dataMap values on given range.
	 * @param moment1 range start
	 * @param moment2 range end
	 * @returns DataMap
	 */
	getDifference: (moment1: Date, moment2: Date) => DataMap

	/**
	 * @async
	 * updated buffer and result from getDataMap.
	 * @param moment Given moment
	 * @returns Consumer
	 */
	update: (moment: Date) => Promise<Consumer>
}

const updateConsumer = (oldBuffer: Buffer) => async (moment: Date) => {
	const buffer = await oldBuffer.update({ moment })

	const consumer: Consumer = {
		getSnapshot: buffer.getSnapshot,
		getDifference: buffer.getDifference,
		update: updateConsumer(buffer),
	}

	return consumer
}

export const createConsumer = async (
	bufferStrategy: BufferStrategy,
	initialDate: Date,
	bufferSize: number
) => {
	const moment = initialDate
	const buffer = await createBuffer({
		strategy: bufferStrategy,
		size: bufferSize,
		moment,
	})

	return updateConsumer(buffer)(moment)
}
