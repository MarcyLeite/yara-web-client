import { mergeData } from '../../utils/merger'
import type { BufferStrategy } from './buffer-strategy'
import type { GenericData, Snapshot } from '../connection/connection'

/**
 * Indentifier key: GenericData value
 */
export type DataMap = Record<string, GenericData>

type BufferOptions = {
	/**
	 * Buffer strategy used by buffer
	 */
	strategy: BufferStrategy
	/**
	 * Size in milesconds
	 * @example size: 60000 // One minute
	 */
	size: number
	/**
	 * Start datetime from buffer
	 */
	moment: Date
}

export type Buffer = {
	/**
	 * @async
	 * It will generate new buffer from a datetime using given strategy. It will use restart strategy
	 * function if moment is before the first or after the last moment saved in itself. Otherwise, it
	 * will use forward funciton.
	 * @returns A new generated buffer with values updated
	 */
	update: (options: Partial<BufferOptions>) => Promise<Buffer>
	/**
	 * It will return a ObjectMap of all last registries from given moment.
	 * @param moment Reference date for initial values
	 * @returns ObjectMap
	 */
	getSnapshot: (moment: Date) => DataMap
	/**
	 * It will return a ObjectMap only values between to given momentns.
	 * @param moment1 Reference date for initial values
	 * @param moment2 Reference date for final values
	 * @returns ObjectMap
	 */
	getDifference: (moment1: Date, moment2: Date) => DataMap
	/**
	 * List of snapshot in buffer
	 */
	snapshotList: Snapshot[]
	/**
	 * Snapshot list length
	 */
	length: number
}

const addToData = (snapshot: Snapshot, dataMap: DataMap) => {
	const data = Object.assign({}, snapshot.data)

	const indexer = data['_measurement'] as string
	const prev = dataMap[indexer]

	if (!prev) {
		dataMap[indexer] = data
		return false
	}

	const newData = mergeData(prev, data)
	dataMap[indexer] = newData

	return true
}

export const updateBuffer = async (
	originalOptions: BufferOptions,
	newOptions: Partial<BufferOptions>,
	prevSnapshotList?: Snapshot[]
) => {
	const strategy = newOptions.strategy ?? originalOptions.strategy
	const size = newOptions.size !== undefined ? newOptions.size : originalOptions.size
	const moment = newOptions.moment ?? originalOptions.moment

	const options = {
		strategy,
		size,
		moment,
	}

	if (strategy !== originalOptions.strategy || prevSnapshotList === undefined) {
		return createBuffer(options)
	}

	const finalDate = new Date(moment.getTime() + size)

	const hasBufferChanges =
		moment.getTime() !== originalOptions.moment.getTime() || size !== originalOptions.size
	const snapshotList = hasBufferChanges
		? await strategy.update(moment, finalDate, prevSnapshotList)
		: prevSnapshotList

	const update = (newOptions: Partial<BufferOptions>) => {
		return updateBuffer(options, newOptions, snapshotList)
	}

	const getSnapshot = (moment: Date) => {
		const dataMap: DataMap = {}
		const time = moment.getTime()

		for (const snapshot of snapshotList) {
			if (snapshot.timestamp > time) {
				break
			}

			addToData(snapshot, dataMap)
		}

		return dataMap
	}

	const getDifference = (moment1: Date, moment2: Date) => {
		const dataMap: DataMap = {}
		const start = moment1.getTime()
		const end = moment2.getTime()

		for (const snapshot of snapshotList) {
			if (snapshot.timestamp < start) {
				continue
			}
			if (snapshot.timestamp > end) {
				break
			}

			addToData(snapshot, dataMap)
		}

		return dataMap
	}

	const buffer: Buffer = {
		update,
		getSnapshot,
		getDifference,
		snapshotList,
		length: snapshotList.length,
	}

	return buffer
}

export const createBuffer = async (options: BufferOptions): Promise<Buffer> => {
	options.size = options.size ?? 1
	const { strategy, moment, size } = options
	const finalDate = new Date(moment.getTime() + size)
	const snapshotList = await strategy.update(moment, finalDate)

	return updateBuffer(options, {}, snapshotList)
}
