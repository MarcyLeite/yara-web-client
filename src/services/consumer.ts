import { createBuffer, type DataMap } from './buffer'
import type { BufferStrategy } from './buffer-strategy'
import type { Buffer } from './buffer'

/**
 * Abstraction of a Consumer that will create a buffer and updated based on time.
 */
export type Consumer = {
	/**
	 * get dataMap from buffer on setted moment.
	 * @param moment get values until this Date
	 * @returns DataMap
	 */
	getDatamap: (moment: Date) => DataMap

	/**
	 * @async
	 * updated buffer and result from getDataMap.
	 * @param moment Given moment
	 * @returns Consumer
	 */
	update: (moment: Date) => Promise<Consumer>
}

const BUFFER_SIZE = 120000

const updateConsumer = (oldBuffer: Buffer) => async (moment: Date) => {
	const buffer = await oldBuffer.update({ moment })

	const consumer: Consumer = {
		getDatamap: (moment) => buffer.getDatamap(moment),
		update: updateConsumer(buffer),
	}

	return consumer
}

export const createConsumer = async (bufferStrategy: BufferStrategy, initialDate: Date) => {
	const moment = initialDate
	const buffer = await createBuffer({
		strategy: bufferStrategy,
		size: BUFFER_SIZE,
		moment,
	})

	return updateConsumer(buffer)(moment)
}
