import { YaraConnection, Snapshot } from '../../src/services/connection'

export const createMockConnection = (): YaraConnection => {
	const snapshotList: Snapshot[] = []

	const now = Date.parse('24 Dec 1997 12:00:00 GMT')

	const pointCount = 100
	for (let i = 0; i < pointCount; i++) {
		const increase = i * 1000
		const timestamp = now + increase

		const pointA: Snapshot = {
			timestamp,
			data: {
				_measurement: 'A',
				status: 'GOOD',
				raw: i,
				eng: i % 12,
			},
		}
		const pointB: Snapshot = {
			timestamp,
			data: {
				_measurement: 'B',
				status: 'BAD',
				raw: i,
				eng: i + 1000,
			},
		}

		const pointC: Snapshot = {
			timestamp,
			data: {
				_measurement: 'C',
				status: i % 2 === 0 ? 'GOOD' : 'BAD',
				raw: i * 4,
				eng: i,
			},
		}

		const pointD: Snapshot = {
			timestamp,
			data: {
				_measurement: 'D',
				status: i % 2 === 0 ? 'GOOD' : 'BAD',
				raw: i * 4,
				eng: i % 2 === 0 ? 'ON' : 'OFF',
			},
		}

		snapshotList.push(pointA, pointB, pointC, pointD)
	}

	return {
		getLastDataFrom: async (date, indexerList) => {
			const timestampDate = date.getTime()
			const indexerSnapshotMap: any = {}
			for (const snapshot of snapshotList) {
				if (snapshot.timestamp > timestampDate) break

				const id = snapshot.data._measurement as string
				if (!indexerList.includes(id)) continue

				indexerSnapshotMap[id] = snapshot
			}

			return Object.values(indexerSnapshotMap)
		},

		getDataFromRange: async (date1, date2, indexerList) => {
			const timestampDate1 = date1.getTime()
			const timestampDate2 = date2.getTime()
			const indexerSnapshotList: Snapshot[] = []

			for (const snapshot of snapshotList) {
				if (snapshot.timestamp <= timestampDate1) continue
				if (snapshot.timestamp > timestampDate2) break

				const id = snapshot.data._measurement as string
				if (!indexerList.includes(id)) continue
				indexerSnapshotList.push(snapshot)
			}

			return indexerSnapshotList
		},
	}
}
