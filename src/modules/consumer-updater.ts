import type { Optional } from '../utils/types'
import type { DataMap } from './consumer/buffer'
import { createConsumer } from './consumer/consumer'
import { createBufferStrategy } from './consumer/buffer-strategy'
import type { Connection } from './connection/connection'
import type { View } from './view'

export const createConsumerUpdater = async (
	initialDate: Date,
	connection: Connection,
	view: View,
	size = 60000
) => {
	const bufferStrategy = createBufferStrategy(connection, view.dataIndexerList)

	let currentMoment = initialDate
	let differenceDataMap: Optional<DataMap> = null
	let fixedDataMap: Optional<DataMap> = null
	let consumer = await createConsumer(bufferStrategy, currentMoment, size)

	const setMoment = (moment: Date) => {
		const prev = currentMoment

		if (!consumer || moment.getTime() === prev.getTime()) {
			return
		}

		fixedDataMap = consumer.getSnapshot(moment)
		differenceDataMap = consumer.getDifference(prev, moment)

		currentMoment = moment
	}

	let timout: number | undefined
	let running = true
	const consumerLoopCallback = async () => {
		consumer = await consumer.update(new Date(currentMoment.getTime() - 10000))
		if (!running) return
		timout = setTimeout(consumerLoopCallback, 100)
	}
	consumerLoopCallback()

	const dispose = () => {
		running = false
		clearTimeout(timout)
	}

	return {
		get fixedDataMap() {
			return fixedDataMap
		},
		get differenceDataMap() {
			return differenceDataMap
		},
		setMoment,
		dispose,
	}
}

export type ConsumerUpdater = Awaited<ReturnType<typeof createConsumerUpdater>>
