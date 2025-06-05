import {
	compareDataMap,
	compareSnapshotInRange,
	createDateFromShift,
	createMockConnection,
} from '../../tests/utils/mock-connection'
import { createBufferStrategy } from './buffer-strategy'
import { createBuffer } from './buffer'
import Sinon from 'sinon'

describe('[Service] Buffer', () => {
	const { mockConnection } = createMockConnection()

	const bufferStrategy = createBufferStrategy(mockConnection, ['A', 'B', 'C', 'D'])

	const strategySpy = Sinon.spy(bufferStrategy, 'update')

	beforeEach(() => {
		strategySpy.resetHistory()
	})

	it('Should create buffer values match data', async () => {
		const initDate = createDateFromShift(5)
		const finalDate = createDateFromShift(65)
		const buffer = await createBuffer({
			strategy: bufferStrategy,
			size: 60000,
			moment: initDate,
		})

		compareSnapshotInRange(buffer.snapshotList, mockConnection, initDate, finalDate)
	})

	it('Should update buffer using forward strategy', async () => {
		const firstInitDate = createDateFromShift(5)
		const firstBuffer = await createBuffer({
			strategy: bufferStrategy,
			size: 60000,
			moment: firstInitDate,
		})

		const initDate = createDateFromShift(6)
		const finalDate = createDateFromShift(6)

		const buffer = await firstBuffer.update({
			moment: initDate,
		})

		compareSnapshotInRange(buffer.snapshotList, mockConnection, initDate, finalDate)
	})

	it('Should gerenerate snapshot from given time', async () => {
		const initDate = createDateFromShift(5)
		const datamapDate = createDateFromShift(8)
		const buffer = await createBuffer({
			strategy: bufferStrategy,
			size: 60000,
			moment: initDate,
		})

		const dataMap = buffer.getSnapshot(datamapDate)

		const dataC = dataMap['C']
		;(dataC._time as string).should.equal('1997-12-24T12:00:06.000Z')

		compareDataMap(buffer.snapshotList, dataMap['A'], datamapDate)
		compareDataMap(buffer.snapshotList, dataMap['B'], datamapDate)
		compareDataMap(buffer.snapshotList, dataMap['C'], datamapDate)
		compareDataMap(buffer.snapshotList, dataMap['D'], datamapDate)
	})

	it('Should not update buffer if not changes had been made', async () => {
		const initDate = createDateFromShift(5)
		const buffer = await createBuffer({
			strategy: bufferStrategy,
			size: 60000,
			moment: initDate,
		})

		buffer.update({})
		strategySpy.callCount.should.equal(1)

		buffer.update({ moment: initDate })
		strategySpy.callCount.should.equal(1)

		buffer.update({ moment: new Date(initDate) })
		strategySpy.callCount.should.equal(1)
	})

	it('Should get buffer length', async () => {
		const initDate = createDateFromShift(5)
		const buffer = await createBuffer({
			strategy: bufferStrategy,
			size: 30000,
			moment: initDate,
		})

		buffer.length.should.equal(104)
	})

	it('Should get difference from given range', async () => {
		const initDate = createDateFromShift(5)
		const buffer = await createBuffer({
			strategy: bufferStrategy,
			size: 60000,
			moment: initDate,
		})

		const datamapInitDate = createDateFromShift(7)
		const datamapEndDate = createDateFromShift(8)

		const dataMap = buffer.getDifference(datamapInitDate, datamapEndDate)

		compareDataMap(buffer.snapshotList, dataMap['A'], datamapEndDate)
		compareDataMap(buffer.snapshotList, dataMap['B'], datamapEndDate)
		should.not.exist(dataMap['C'])
		compareDataMap(buffer.snapshotList, dataMap['D'], datamapEndDate)
	})
	it('Should include first values from difference', async () => {
		const initDate = createDateFromShift(5)
		const buffer = await createBuffer({
			strategy: bufferStrategy,
			size: 60000,
			moment: initDate,
		})

		const datamapInitDate = createDateFromShift(6)
		const datamapEndDate = createDateFromShift(8)

		const dataMap = buffer.getDifference(datamapInitDate, datamapEndDate)

		compareDataMap(buffer.snapshotList, dataMap['C'], datamapEndDate)
	})
	it('Should not include first values from difference', async () => {
		const initDate = createDateFromShift(5)
		const buffer = await createBuffer({
			strategy: bufferStrategy,
			size: 60000,
			moment: initDate,
		})

		const datamapInitDate = createDateFromShift(7)
		const datamapEndDate = createDateFromShift(9)

		const dataMap = buffer.getDifference(datamapInitDate, datamapEndDate)

		compareDataMap(buffer.snapshotList, dataMap['C'], datamapEndDate)
	})
})
