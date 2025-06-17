import { createDemoConnection } from './connection-demo'
import { createDateFromShift, INITIAL_DATE } from '../../../tests/utils/mock-connection'
import { Snapshot } from './connection'
import { getRandomInt } from '../../utils/math'

describe('[Connection] Connection Demo', async () => {
	const connection = createDemoConnection({
		type: 'demo',
		seed: 'random seed',
		dataProperties: [
			{
				indexer: 'hot1',
				behavior: 'hot',
			},
			{
				indexer: 'hot2',
				behavior: 'hot',

				chance: 1,
				max: 50,
				defaultValue: 49,
			},
			{
				indexer: 'cold1',
				behavior: 'cold',
			},
			{
				indexer: 'cold2',
				behavior: 'cold',

				chance: 1,
				min: 49,
				defaultValue: 50,
			},
			{
				indexer: 'walk',
				behavior: 'walk',
			},
		],
	})
	const indexerList = ['hot1', 'hot2', 'cold1', 'cold2', 'walk']

	beforeEach(async () => {
		await connection.getLastDataFrom(INITIAL_DATE, indexerList)
	})

	const checkInitDate = (snapshotList: Snapshot[]) => {
		for (const snapshot of snapshotList) {
			snapshot.timestamp.should.equal(createDateFromShift(1).getTime())
		}

		snapshotList[0].data._measurement.should.equal('hot1')
		snapshotList[0].data.eng.should.equal(51)
		snapshotList[1].data._measurement.should.equal('hot2')
		snapshotList[1].data.eng.should.equal(48)
		snapshotList[2].data._measurement.should.equal('cold1')
		snapshotList[2].data.eng.should.equal(50)
		snapshotList[3].data._measurement.should.equal('cold2')
		snapshotList[3].data.eng.should.equal(49)
		snapshotList[4].data._measurement.should.equal('walk')
		snapshotList[4].data.eng.should.equal(50)
	}

	const checkDifference = (snapshotList: Snapshot[]) => {
		snapshotList.length.should.equal(15)
		for (const i in snapshotList) {
			const snapshot = snapshotList[i]
			const shift = Math.floor(Number(i) / indexerList.length)
			snapshot.timestamp.should.equal(createDateFromShift(60 + shift).getTime())
		}

		snapshotList[0].data._measurement.should.equal('hot1')
		snapshotList[0].data.eng.should.equal(66)
		snapshotList[1].data._measurement.should.equal('hot2')
		snapshotList[1].data.eng.should.equal(49)
		snapshotList[2].data._measurement.should.equal('cold1')
		snapshotList[2].data.eng.should.equal(35)
		snapshotList[3].data._measurement.should.equal('cold2')
		snapshotList[3].data.eng.should.equal(49)
		snapshotList[4].data._measurement.should.equal('walk')
		snapshotList[4].data.eng.should.equal(44)

		snapshotList[5].data._measurement.should.equal('hot1')
		snapshotList[5].data.eng.should.equal(66)
		snapshotList[6].data._measurement.should.equal('hot2')
		snapshotList[6].data.eng.should.equal(50)
		snapshotList[7].data._measurement.should.equal('cold1')
		snapshotList[7].data.eng.should.equal(35)
		snapshotList[8].data._measurement.should.equal('cold2')
		snapshotList[8].data.eng.should.equal(49)
		snapshotList[9].data._measurement.should.equal('walk')
		snapshotList[9].data.eng.should.equal(43)

		snapshotList[10].data._measurement.should.equal('hot1')
		snapshotList[10].data.eng.should.equal(66)
		snapshotList[11].data._measurement.should.equal('hot2')
		snapshotList[11].data.eng.should.equal(50)
		snapshotList[12].data._measurement.should.equal('cold1')
		snapshotList[12].data.eng.should.equal(35)
		snapshotList[13].data._measurement.should.equal('cold2')
		snapshotList[13].data.eng.should.equal(50)
		snapshotList[14].data._measurement.should.equal('walk')
		snapshotList[14].data.eng.should.equal(43)
	}

	it('Should get last data', async () => {
		const snapshotList = await connection.getLastDataFrom(createDateFromShift(1), indexerList)
		checkInitDate(snapshotList)
	})

	it('Should not go over when max property is set', async () => {
		const snapshotList = await connection.getLastDataFrom(createDateFromShift(100), indexerList)
		const hotSnapshot = snapshotList[1]
		hotSnapshot.data.eng.should.not.be.greaterThan(50)
	})

	it('Should come back to value when max property is hitted and set', async () => {
		await connection.getLastDataFrom(createDateFromShift(300), indexerList)
		const snapshotList = await connection.getLastDataFrom(createDateFromShift(3), indexerList)

		const hotSnapshot = snapshotList[1]
		hotSnapshot.data.eng.should.equal(48)
	})

	it('Should not go under when min property is set', async () => {
		const snapshotList = await connection.getLastDataFrom(createDateFromShift(100), indexerList)
		const coldSnapshot = snapshotList[3]
		coldSnapshot.data.eng.should.not.be.lessThan(49)
	})

	it('Should come back to value when min property is hitted and set', async () => {
		await connection.getLastDataFrom(createDateFromShift(100), indexerList)
		const snapshotList = await connection.getLastDataFrom(createDateFromShift(22), indexerList)

		const coldSnapshot = snapshotList[3]
		coldSnapshot.data.eng.should.not.be.lessThan(51)
	})

	it('Should not change last data result after another two queries', async () => {
		await connection.getLastDataFrom(createDateFromShift(60), indexerList)
		await connection.getLastDataFrom(createDateFromShift(30), indexerList)

		const snapshotList = await connection.getLastDataFrom(createDateFromShift(1), indexerList)
		checkInitDate(snapshotList)
	})

	it('Should query difference', async () => {
		const snapshotList = await connection.getDataFromRange(
			createDateFromShift(60),
			createDateFromShift(62),
			indexerList
		)
		checkDifference(snapshotList)
	})

	it('Should not change difference result after another two queries', async () => {
		await connection.getDataFromRange(createDateFromShift(80), createDateFromShift(98), indexerList)
		await connection.getDataFromRange(createDateFromShift(0), createDateFromShift(20), indexerList)

		const snapshotList = await connection.getDataFromRange(
			createDateFromShift(60),
			createDateFromShift(62),
			indexerList
		)
		checkDifference(snapshotList)
	})

	it('Should work when repeating queries', async () => {
		await connection.getLastDataFrom(createDateFromShift(1), indexerList)
		const snapshotList = await connection.getLastDataFrom(createDateFromShift(1), indexerList)

		checkInitDate(snapshotList)
	})

	it('Should not change difference result after random ammount of queries', async function () {
		this.timeout(0)
		for (let i = 0; i < 100; i++) {
			const shift = getRandomInt(1, 600)
			const date1 = createDateFromShift(shift)
			const date2 = createDateFromShift(shift + getRandomInt(0, 120))

			switch (getRandomInt(0, 4)) {
				case 1:
					await connection.getLastDataFrom(date1, indexerList)
					break
				case 2:
					await connection.getDataFromRange(date1, date2, indexerList)
					break
				case 3:
					await connection.getLastDataFrom(date1, indexerList)
					await connection.getDataFromRange(date1, date2, indexerList)
					break
			}
		}
		const lastSnapshotList = await connection.getLastDataFrom(createDateFromShift(1), indexerList)
		checkInitDate(lastSnapshotList)

		const differenceSnapshotList = await connection.getDataFromRange(
			createDateFromShift(60),
			createDateFromShift(62),
			indexerList
		)
		checkDifference(differenceSnapshotList)
	})
})
