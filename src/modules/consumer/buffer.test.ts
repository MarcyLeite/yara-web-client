import { createBuffer, createBufferValues, updateBufferValuesFoward } from './buffer'
import { IndamoConnection, IndamoData, IndamoDataMap, IndamoDataSnapshot } from './connection'

describe.only('Indamo: Consumer Buffer', () => {
	const indexerList = ['A', 'B']

	const createMockSnapshot = (
		second: number,
		valueA: number | null,
		valueB: number | null
	): IndamoDataSnapshot => {
		const map: Record<string, IndamoData> = {}
		if (valueA !== null) {
			map['A'] = { value: valueA }
		}
		if (valueB !== null) {
			map['B'] = { value: valueB }
		}
		return {
			timestamp: new Date(2000, 0, 1, 10, 0, second).getTime(),
			map,
		}
	}

	const snapshotList = [
		createMockSnapshot(0, 0, 10),
		createMockSnapshot(5, 1, null),
		createMockSnapshot(10, null, 11),
		createMockSnapshot(15, 2, 12),
	]
	const createMockConnection = (): IndamoConnection => {
		return {
			getLastDataFrom: (date: Date, _indexerList: string[]) => {
				let timestamp = date.getTime()
				const map: IndamoDataMap = {}
				for (const snapshot of snapshotList) {
					if (snapshot.timestamp > date.getTime()) {
						return {
							timestamp,
							map,
						}
					}
					timestamp = snapshot.timestamp
					if (snapshot.map['A']) {
						map['A'] = snapshot.map['A']
					}
					if (snapshot.map['B']) {
						map['B'] = snapshot.map['B']
					}
				}
				return {
					timestamp: date.getTime(),
					map,
				}
			},
			getDataFromRange: (date1: Date, date2: Date, _indexerList: string[]) => {
				const list: IndamoDataSnapshot[] = []
				for (const snapshot of snapshotList) {
					if (snapshot.timestamp <= date1.getTime()) {
						continue
					}
					if (snapshot.timestamp > date2.getTime()) {
						return list
					}

					list.push(snapshot)
				}
				return list
			},
		}
	}

	it('Should buffer values match 1', () => {
		const { initialValues, differenceList } = createBufferValues({
			connection: createMockConnection(),
			indexerList,
			moment: new Date(2000, 0, 1, 10, 0, 4),
			sizeInSeconds: 10,
		})

		initialValues.timestamp.should.equal(new Date(2000, 0, 1, 10, 0, 0).getTime())
		initialValues.map['A'].value.should.equal(0)
		initialValues.map['B'].value.should.equal(10)

		differenceList.should.have.length(2)

		differenceList[0].timestamp.should.equal(new Date(2000, 0, 1, 10, 0, 5).getTime())
		differenceList[1].timestamp.should.equal(new Date(2000, 0, 1, 10, 0, 10).getTime())

		differenceList[0].map['A'].value.should.equal(1)
		should.not.exist(differenceList[0].map['B'])

		should.not.exist(differenceList[1].map['A'])
		differenceList[1].map['B'].value.should.equal(11)
	})

	it('Should buffer values match 2', () => {
		const { initialValues, differenceList } = createBufferValues({
			connection: createMockConnection(),
			indexerList,
			moment: new Date(2000, 0, 1, 10, 0, 4),
			sizeInSeconds: 15,
		})

		initialValues.timestamp.should.equal(new Date(2000, 0, 1, 10, 0, 0).getTime())
		initialValues.map['A'].value.should.equal(0)
		initialValues.map['B'].value.should.equal(10)

		differenceList.should.have.length(3)

		differenceList[0].timestamp.should.equal(new Date(2000, 0, 1, 10, 0, 5).getTime())
		differenceList[1].timestamp.should.equal(new Date(2000, 0, 1, 10, 0, 10).getTime())
		differenceList[2].timestamp.should.equal(new Date(2000, 0, 1, 10, 0, 15).getTime())

		differenceList[0].map['A'].value.should.equal(1)
		should.not.exist(differenceList[0].map['B'])

		should.not.exist(differenceList[1].map['A'])
		differenceList[1].map['B'].value.should.equal(11)

		differenceList[2].map['A'].value.should.equal(2)
		differenceList[2].map['B'].value.should.equal(12)
	})

	it('Should first snapshot not be on different list when starter moment is the same as snapshot timestamp', () => {
		const { differenceList } = createBufferValues({
			connection: createMockConnection(),
			indexerList,
			moment: new Date(2000, 0, 1, 10, 0, 5),
			sizeInSeconds: 10,
		})

		differenceList.length.should.equal(2)
	})

	it('Should get all last values before given time even if outside range', () => {
		const buffer = createBuffer({
			connection: createMockConnection(),
			indexerList,
			moment: new Date(2000, 0, 1, 10, 0, 5),
			sizeInSeconds: 10,
		})

		const map = buffer.snapshot(new Date(2000, 0, 1, 10, 0, 5))
		map['A'].value.should.equal(1)
		map['B'].value.should.equal(10)
	})

	it('Should get all last values from snapshot of time 1', () => {
		const buffer = createBuffer({
			connection: createMockConnection(),
			indexerList,
			moment: new Date(2000, 0, 1, 10, 0, 0),
			sizeInSeconds: 10,
		})

		const map = buffer.snapshot(new Date(2000, 0, 1, 10, 0, 0))
		map['A'].value.should.equal(0)
		map['B'].value.should.equal(10)
	})

	it('Should get all last values from snapshot of time 2', () => {
		const buffer = createBuffer({
			connection: createMockConnection(),
			indexerList,
			moment: new Date(2000, 0, 1, 10, 0, 5),
			sizeInSeconds: 10,
		})

		const map = buffer.snapshot(new Date(2000, 0, 1, 10, 0, 10))
		map['A'].value.should.equal(1)
		map['B'].value.should.equal(11)
	})

	it('Should get only difference from moments', () => {
		const buffer = createBuffer({
			connection: createMockConnection(),
			indexerList,
			moment: new Date(2000, 0, 1, 10, 0, 4),
			sizeInSeconds: 10,
		})

		const map = buffer.difference(new Date(2000, 0, 1, 10, 0, 4), new Date(2000, 0, 1, 10, 0, 7))
		map['A'].value.should.equal(1)
		should.not.exist(map['B'])
	})

	it('Should include last moment when getting difference', () => {
		const buffer = createBuffer({
			connection: createMockConnection(),
			indexerList,
			moment: new Date(2000, 0, 1, 10, 0, 4),
			sizeInSeconds: 10,
		})

		const map = buffer.difference(new Date(2000, 0, 1, 10, 0, 5), new Date(2000, 0, 1, 10, 0, 10))
		should.not.exist(map['A'])
		map['B'].value.should.equal(11)
	})

	it('Should ignore first moment of difference', () => {
		const buffer = createBuffer({
			connection: createMockConnection(),
			indexerList,
			moment: new Date(2000, 0, 1, 10, 0, 5),
			sizeInSeconds: 10,
		})

		const map = buffer.difference(new Date(2000, 0, 1, 10, 0, 5), new Date(2000, 0, 1, 10, 0, 7))

		should.not.exist(map['A'])
		should.not.exist(map['B'])
	})

	it('Should update given initial buffer values and forward moment', () => {
		const initialBufferValues = createBufferValues({
			connection: createMockConnection(),
			indexerList,
			moment: new Date(2000, 0, 1, 10, 0, 0),
			sizeInSeconds: 10,
		})

		const { initialValues, differenceList } = updateBufferValuesFoward({
			connection: createMockConnection(),
			indexerList,
			moment: new Date(2000, 0, 1, 10, 0, 5),
			sizeInSeconds: 10,
			bufferValues: initialBufferValues,
		})

		initialValues.timestamp.should.equal(new Date(2000, 0, 1, 10, 0, 5).getTime())
		initialValues.map['A'].value.should.equal(1)
		initialValues.map['B'].value.should.equal(10)

		differenceList.should.have.length(2)

		differenceList[0].timestamp.should.equal(new Date(2000, 0, 1, 10, 0, 10).getTime())

		should.not.exist(differenceList[0].map['A'])
		differenceList[0].map['B'].value.should.equal(11)

		differenceList[1].timestamp.should.equal(new Date(2000, 0, 1, 10, 0, 15).getTime())

		differenceList[1].map['A'].value.should.equal(2)
		differenceList[1].map['B'].value.should.equal(12)
	})

	it('Should update buffer', () => {
		const buffer = createBuffer({
			connection: createMockConnection(),
			indexerList,
			moment: new Date(2000, 0, 1, 10, 0, 0),
			sizeInSeconds: 10,
		})

		const updatedBuffer = buffer.update(new Date(2000, 0, 1, 10, 0, 5))!

		const originalSnapshot = buffer.snapshot(new Date(2000, 0, 1, 10, 0, 0))
		originalSnapshot['A'].value.should.equal(0)
		originalSnapshot['B'].value.should.equal(10)

		const snapshot1 = updatedBuffer.snapshot(new Date(2000, 0, 1, 10, 0, 0))
		Object.keys(snapshot1).length.should.equal(0)

		const snapshot2 = updatedBuffer.snapshot(new Date(2000, 0, 1, 10, 0, 15))
		snapshot2['A'].value.should.equal(2)
		snapshot2['B'].value.should.equal(12)
	})
})
