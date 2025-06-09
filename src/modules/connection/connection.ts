import { createConnectionInfluxDB, type ConnectionInfluxDBConfig } from './connection-influxdb'

export type ConnectionConfigType = {
	type: string
}

export type ConnectionConfig = ConnectionInfluxDBConfig

/**
 * Unknown object returned by database.
 * @exemple
 * ```ts
 * const genericData: GenericData = {
 *   id: "Foo",
 *   status: "off",
 *   value: 3
 * }
 * ```
 */
export type GenericData = Record<string, unknown>

/**
 * Timestamped generic data object
 */
export type Snapshot = {
	timestamp: number
	data: GenericData
}

/**
 * Abstraction of connection object used by Yara system
 */
export type Connection = {
	/**
	 * Get last objects before date.
	 * @param date Reference date which will be determinate the search.
	 * @param indexerList List of indexes that will be searched.
	 * @returns Snapshot of last object with the moment they where changed.
	 */
	getLastDataFrom: (date: Date, indexerList: string[]) => Promise<Snapshot[]>
	/**
	 * Get objects that changes on certain date range
	 * @param date1 Reference of start date that will be search.
	 * @param date2 Reference of end date that will be search.
	 * @param indexerList List of indexes that will be searched.
	 * @returns Snapshot of objects that changed in this range with the moment they change.
	 */
	getDataFromRange: (date1: Date, date2: Date, indexerList: string[]) => Promise<Snapshot[]>
}

export const createConnection = (config: ConnectionConfig) => {
	if (config.type === 'influxdb') {
		return createConnectionInfluxDB(config)
	}

	throw new Error('Error')
}
