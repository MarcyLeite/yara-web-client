import { mergeData } from '../utils/merger'
import type { BufferStrategy } from './buffer-strategy'
import type { GenericData, Snapshot } from './connection'

/**
 * Indentifier key: GenericData value.
 */
export type DataMap = Record<string, GenericData>

/**
 * Params passed to buffer on creation.
 */
type BufferOptions = {
	/**
	 * Buffer strategy used by buffer.
	 */
	strategy: BufferStrategy
	/**
	 * Size in milesconds.
	 * @example size: 60000 // One minute
	 */
	size: number
	/**
	 * Starter datetime from buffer
	 */
	moment: Date
}

/**
 * Abstraction of Buffer used to make database consuption efficient
 */
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
	 * It will return a ObjectMap if of all last registries from given moment.
	 * @param moment Reference date for initial values
	 * @returns ObjectMap
	 */
	getDatamap: (moment: Date) => DataMap
	/**
	 * List of snapshot in buffer
	 */
	snapshotList: Snapshot[]
	/**
	 * Snapshot list length
	 */
	length: number
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
		? await strategy.update({
				snapshotList: prevSnapshotList,
				from: moment,
				to: finalDate,
			})
		: prevSnapshotList

	const update = (options: Partial<BufferOptions>) => {
		return updateBuffer(originalOptions, options, snapshotList)
	}

	const getDatamap = (moment: Date) => {
		const dataMap: DataMap = {}
		const time = moment.getTime()

		for (const snapshot of snapshotList) {
			if (snapshot.timestamp > time) {
				break
			}
			const data = Object.assign({}, snapshot.data)

			const indexer = data['_measurement'] as string
			const prev = dataMap[indexer]

			if (!prev) {
				dataMap[indexer] = data
				continue
			}

			const newData = mergeData(prev, data)
			dataMap[indexer] = newData
		}

		return dataMap
	}

	const buffer: Buffer = {
		update,
		getDatamap,
		snapshotList,
		length: snapshotList.length,
	}

	return buffer
}

export const createBuffer = async (options: BufferOptions): Promise<Buffer> => {
	options.size = options.size ?? 1
	const { strategy, moment, size } = options
	const finalDate = new Date(moment.getTime() + size)
	const snapshotList = await strategy.update({
		from: moment,
		to: finalDate,
	})

	return updateBuffer(options, {}, snapshotList)
}
