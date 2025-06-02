import { InfluxDB } from '@influxdata/influxdb-client'
import type { GenericData, Snapshot, Connection, ConnectionConfigType } from './connection'
import { sortByTimestamp } from '../utils/sorter'
import { mergeData } from '../utils/merger'

/**
 * InfluxDB yara configuration format
 */
export type ConnectionInfluxDBConfig = {
	type: 'influxdb'
	url: string
	token: string
	org: string
	bucket: string
} & ConnectionConfigType

const fixTime = (date: Date) => Math.floor(date.getTime() / 1000)

export const createConnectionInfluxDB = ({
	url,
	token,
	org,
	bucket,
}: ConnectionInfluxDBConfig): Connection => {
	const queryApi = new InfluxDB({ url: url, token }).getQueryApi({ org })

	const getLastQuery = (date: Date, indexerList: string[]) => {
		const dateSeconds = fixTime(date)
		return `from(bucket: "${bucket}")
	|> range(start: ${dateSeconds - 432000}, stop: ${dateSeconds})
	|> filter(fn: (r) => ${indexerList.map((indexer) => `r["_measurement"] == "${indexer}"`).join(' or ')})
  |> filter(fn: (r) => r["_field"] == "eng" or r["_field"] == "raw")
	|> group(columns: ["_measurement", "_field"], mode:"by")
	|> last()
	|> pivot(rowKey: ["_measurement", "_time", "status"], columnKey: ["_field"], valueColumn: "_value")
		`
	}

	const getDifferenceQuery = (date1: Date, date2: Date, indexerList: string[]) => {
		return `
from(bucket: "${bucket}")
	|> range(start: ${fixTime(date1)}, stop: ${fixTime(date2)})
	|> filter(fn: (r) => ${indexerList.map((indexer) => `r["_measurement"] == "${indexer}"`).join(' or ')})
	|> filter(fn: (r) => r["_field"] == "eng" or r["_field"] == "raw")
	|> group(columns: ["_measurement", "_field"], mode:"by")
	|> pivot(rowKey: ["_measurement", "_time", "status"], columnKey: ["_field"], valueColumn: "_value")
		`
	}

	const queryLast = async (queryString: string) => {
		const indexerSnapshotMap: Record<string, Snapshot> = {}

		for await (const { values, tableMeta } of queryApi.iterateRows(queryString)) {
			const o: GenericData = tableMeta.toObject(values)
			const indexer = o['_measurement'] as string

			const snapshot = {
				timestamp: new Date(o['_time'] as string).getTime(),
				data: o,
			}

			const prev = indexerSnapshotMap[indexer]
			if (prev) {
				const data =
					prev.timestamp < snapshot.timestamp ? mergeData(prev.data, o) : mergeData(o, prev.data)
				snapshot.data = data
			}

			indexerSnapshotMap[indexer] = snapshot
		}

		const snapshotList = Object.values(indexerSnapshotMap)
		return snapshotList.sort(sortByTimestamp)
	}

	const query = async (queryString: string) => {
		const snapshotList: Snapshot[] = []

		for await (const { values, tableMeta } of queryApi.iterateRows(queryString)) {
			const o: GenericData = tableMeta.toObject(values)
			const snapshot = {
				timestamp: new Date(o['_time'] as string).getTime(),
				data: o,
			}
			snapshotList.push(snapshot)
		}

		return snapshotList.sort(sortByTimestamp)
	}

	return {
		getLastDataFrom: async (date, indexerList) => {
			const queryString = getLastQuery(date, indexerList)
			const result = await queryLast(queryString)
			return result
		},
		getDataFromRange: async (date1, date2, indexerList) => {
			const result = await query(getDifferenceQuery(date1, date2, indexerList))
			return result
		},
	}
}
