import { Connection, Snapshot, GenericData } from '../../src/modules/connection/connection'

const createRangeList = async (connection: Connection, initDate: Date, finalDate: Date) => {
	const l = ['A', 'B', 'C', 'D']
	const startValues = await connection.getLastDataFrom(initDate, l)
	const differenceValues = await connection.getDataFromRange(initDate, finalDate, l)

	return [...startValues, ...differenceValues]
}

export const compareDataMap = (snapshotList: Snapshot[], point: GenericData, moment: Date) => {
	const time = moment.getTime()
	const buildPoint: GenericData = {}

	const indexer = point['_measurement'] as string

	for (const snapshot of snapshotList) {
		if (snapshot.timestamp > time) break
		if (snapshot.data['_measurement'] !== indexer) continue
		for (const [key, value] of Object.entries(snapshot.data)) {
			buildPoint[key] = value
		}
	}

	for (const [key, value] of Object.entries(point) as [string, any][]) {
		value.should.equal(buildPoint[key])
	}
}

export const compareSnapshotInRange = async (
	snapshotList: Snapshot[],
	connection: Connection,
	initDate: Date,
	finalDate: Date
) => {
	const rangeSnapshotList = await createRangeList(connection, initDate, finalDate)

	for (let i = 0; i < snapshotList.length; i++) {
		const bufferValue = snapshotList[i]
		const mockValue = rangeSnapshotList[i]

		bufferValue.timestamp.should.equal(mockValue.timestamp)
		for (const [key, value] of Object.entries(bufferValue.data)) {
			;(mockValue.data[key] as any).should.equal(value)
		}
	}
}

export const INITIAL_DATE = new Date('24 Dec 1997 12:00:00 GMT')
export const createDateFromShift = (seconds: number) =>
	new Date(INITIAL_DATE.getTime() + seconds * 1000)

export const FINAL_DATE = createDateFromShift(100)

export const createMockConnection = (): {
	mockConnection: Connection
	mockSnapshotList: Snapshot[]
} => {
	const snapshotList: Snapshot[] = []

	const now = INITIAL_DATE.getTime()

	const pointCount = 100
	for (let i = 0; i < pointCount; i++) {
		const increase = i * 1000
		const timestamp = now + increase
		const _time = new Date(timestamp).toISOString()

		const pointA: Snapshot = {
			timestamp,
			data: {
				_time,
				_measurement: 'A',
				status: 'GOOD',
				raw: i,
				eng: i % 12,
			},
		}
		const pointB: Snapshot = {
			timestamp,
			data: {
				_time,
				_measurement: 'B',
				status: 'BAD',
				raw: i,
				eng: i + 1000,
			},
		}

		const pointC: Snapshot = {
			timestamp,
			data: {
				_time,
				_measurement: 'C',
				status: i % 2 === 0 ? 'GOOD' : 'BAD',
				raw: i * 4,
				eng: i,
			},
		}

		const pointD: Snapshot = {
			timestamp,
			data: {
				_time,
				_measurement: 'D',
				status: i % 2 === 0 ? 'GOOD' : 'BAD',
				raw: i * 4,
				eng: i % 2 === 0 ? 'ON' : 'OFF',
			},
		}

		snapshotList.push(pointA, pointB, pointD)
		if (i % 3 === 0) {
			snapshotList.push(pointC)
		}
	}

	return {
		mockConnection: {
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
		},
		mockSnapshotList: snapshotList,
	}
}
