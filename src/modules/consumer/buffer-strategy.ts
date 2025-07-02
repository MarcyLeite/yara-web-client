import { mergeData } from '../../utils/merger'
import type { Snapshot, Connection } from '../connection/connection'

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

export const createBufferStrategy = (connection: Connection, indexerList: string[]) => {
	const bufferStrategy = {
		/**
		 * @async
		 *
		 * It will populate a SnapshotList without using any previous values
		 * @param from Reference date for initial values. It will query all values before this date
		 * @param to Reference date for the final values loaded
		 * @returns Snapshot[]
		 */
		restart: async (from: Date, to: Date) => {
			const startValues = await connection.getLastDataFrom(from, indexerList)
			const differenceValues = await connection.getDataFromRange(from, to, indexerList)

			return [...startValues, ...differenceValues]
		},

		/**
		 * @async
		 *
		 * It will shift SnapshotList to given date and queries missing values until "to" Date
		 * @param snapshotList previous lodaded SnapshotMap
		 * @param from Reference date for initial values
		 * @param to Reference date for final values
		 * @returns Snapshot[]
		 */
		forward: async (from: Date, to: Date, snapshotList: Snapshot[]) => {
			const endDate = new Date(snapshotList.at(-1)!.timestamp)

			const shiftedValues = mergeSnapshotUntil(snapshotList, from)
			const differenceValues = await connection.getDataFromRange(endDate, to, indexerList)
			return [...shiftedValues, ...differenceValues]
		},

		/**
		 * @async
		 *
		 * It will try to update using best strategy depending on parameters
		 *
		 * If param "from" is set to a date before the first value in buffer, it will use restart method
		 *
		 * If param "from" is set to a date in range of buffer, it will use forward method
		 *
		 * If param "from" is set to a date the last value in buffer, it will not update
		 *
		 * @param from Reference date for initial values
		 * @param to Reference date for final values
		 * @param snapshotList OPTIONAL Previous snaphostList
		 * @returns Snapshot[]
		 */
		update: async (from: Date, to: Date, snapshotList?: Snapshot[]) => {
			const useRestart = () => bufferStrategy.restart(from, to)

			if (snapshotList === undefined || snapshotList.length === 0) {
				return await useRestart()
			}
			const begin = snapshotList[0].timestamp
			const fromTime = from.getTime()

			if (fromTime < begin) {
				return await useRestart()
			}

			const lastSnapshot = snapshotList.at(-1)!
			const end = lastSnapshot.timestamp

			if (end < fromTime) {
				return snapshotList
			}

			return await bufferStrategy.forward(from, to, snapshotList)
		},
	}

	return bufferStrategy
}

export type BufferStrategy = ReturnType<typeof createBufferStrategy>
