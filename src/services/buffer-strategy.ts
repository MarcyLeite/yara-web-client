import { mergeData } from '../utils/merger'
import type { Snapshot, Connection } from './connection'

export type updateOptions = {
	snapshotList?: Snapshot[]
	from: Date
	to: Date
}

/**
 * Abstraction of strategies to consume a database and store in a buffer.
 */
export type BufferStrategy = {
	/**
	 * @async
	 * It will populate a SnapshotList without using any previous values
	 * @param from Reference date for initial values (It will bring all last values before this date)
	 * @param to Reference date for the final values loaded
	 * @returns Snapshot[]
	 */
	restart: (from: Date, to: Date) => Promise<Snapshot[]>
	/**
	 * @async
	 * It will shift SnapshotList to given date and queries missing values until "to" Date
	 * @param snapshotMap previous lodaded SnapshotMap
	 * @param to Reference date for initial values (It will be calculated from given snapshotMap)
	 * @returns Snapshot[]
	 */
	forward: (snapshotList: Snapshot[], from: Date, to: Date) => Promise<Snapshot[]>

	/**
	 * @async
	 * It will try to update using best strategy depending on parameters.
	 * If from value is before the first value in buffer, it will use restart method.
	 * If from value is after the last value in buffer, it will use restart method.
	 * If from value is in range of buffer, it will use forward method
	 * @returns Snapshot[]
	 */
	update: (options: updateOptions) => Promise<Snapshot[]>
}

const mergeSnapshotUntil = (snapshotList: Snapshot[], to: Date) => {
	const indexerSnapshotMap: Record<string, Snapshot> = {}

	const keepList: Snapshot[] = []
	for (const snapshot of snapshotList) {
		if (snapshot.timestamp <= to.getTime()) {
			const data = Object.assign({}, snapshot.data)

			const indexer = data['_measurement'] as string
			const prev = indexerSnapshotMap[indexer]
			if (!prev) {
				indexerSnapshotMap[indexer] = {
					timestamp: snapshot.timestamp,
					data,
				}
				continue
			}

			const newData = mergeData(prev.data, data)
			prev.data = newData
			prev.timestamp = snapshot.timestamp

			indexerSnapshotMap[indexer] = prev
			continue
		}

		keepList.push(snapshot)
	}

	return [...Object.values(indexerSnapshotMap), ...keepList]
}

export const createBufferStrategy = (
	connection: Connection,
	indexerList: string[]
): BufferStrategy => {
	const bufferStrategy: BufferStrategy = {
		restart: async (from, to) => {
			const startValues = await connection.getLastDataFrom(from, indexerList)
			const differenceValues = await connection.getDataFromRange(from, to, indexerList)

			return [...startValues, ...differenceValues]
		},
		forward: async (snapshotList, from, to) => {
			const endDate = new Date(snapshotList.at(-1)!.timestamp)

			const shiftedValues = mergeSnapshotUntil(snapshotList, from)
			const differenceValues = await connection.getDataFromRange(endDate, to, indexerList)
			return [...shiftedValues, ...differenceValues]
		},
		update: async ({ snapshotList, from, to }: updateOptions) => {
			const useRestart = () => bufferStrategy.restart(from, to)

			if (snapshotList === undefined) {
				return useRestart()
			}
			const begin = snapshotList[0].timestamp
			const fromTime = from.getTime()

			if (fromTime < begin) {
				return await useRestart()
			}

			const lastSnapshot = snapshotList.at(-1)!
			const end = lastSnapshot.timestamp

			if (end < fromTime) {
				return await useRestart()
			}

			return await bufferStrategy.forward(snapshotList, from, to)
		},
	}

	return bufferStrategy
}
