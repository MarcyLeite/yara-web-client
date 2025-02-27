import { YaraConnection, YaraDataSnapshot } from './connection'

export const createBuffer = () => {
	const initialSnapshot: YaraDataSnapshot = {
		timestamp: 0,
		map: {},
	}
	const differenceSnapshotList: YaraDataSnapshot[] = []

	return { initialSnapshot, differenceSnapshotList }
}
export type YaraBuffer = ReturnType<typeof createBuffer>

export const createLinkedBuffer = async (
	connection: YaraConnection,
	indexerList: string[],
	dateFrom: Date,
	dateTo: Date
) => {
	const buffer = createBuffer()
	buffer.initialSnapshot = await connection.getLastDataFrom(dateFrom, indexerList)
	buffer.differenceSnapshotList = await connection.getDataFromRange(dateFrom, dateTo, indexerList)

	return buffer
}

export const takeSnapshot = (
	{ initialSnapshot, differenceSnapshotList }: YaraBuffer,
	moment: Date
) => {
	let timestamp = initialSnapshot.timestamp
	const map = Object.assign({}, initialSnapshot.map)

	for (const difference of differenceSnapshotList) {
		if (timestamp > moment.getTime()) break

		timestamp = difference.timestamp
		for (const [key, value] of Object.entries(difference.map)) {
			map[key] = value
		}
	}

	return { timestamp, map }
}
