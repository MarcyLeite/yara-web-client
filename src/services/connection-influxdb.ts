import { InfluxDB } from '@influxdata/influxdb-client'
import type { Snapshot, YaraConnection } from './connection'

/**
 * InfluxDB yara configuration format
 */
export type YaraConnectionInfluxDBConfig = {
	type: 'influxdb'
	options: {
		url: string
		token: string
		org: string
		bucket: string
	}
}

const fixTime = (date: Date) => Math.floor(date.getTime() / 1000)

export const createConnectionInfluxDB = ({
	url,
	token,
	org,
	bucket,
}: YaraConnectionInfluxDBConfig['options']): YaraConnection => {
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

	const query = async (queryString: string) => {
		const snapshotList: Snapshot[] = []

		for await (const { values, tableMeta } of queryApi.iterateRows(queryString)) {
			const o = tableMeta.toObject(values)
			const snapshot: Snapshot = {
				timestamp: new Date(o._time).getTime(),
				data: o,
			}
			snapshotList.push(snapshot)
		}

		return snapshotList.sort((a, b) => a.timestamp - b.timestamp)
	}

	return {
		getLastDataFrom: async (date, indexerList) => {
			const result = await query(getLastQuery(date, indexerList))
			return result
		},
		getDataFromRange: async (date1, date2, indexerList) => {
			const result = await query(getDifferenceQuery(date1, date2, indexerList))
			return result
		},
	}
}
