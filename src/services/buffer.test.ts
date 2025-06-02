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

	it('Should gerenerate datamap from given time', async () => {
		const initDate = createDateFromShift(5)
		const datamapDate = createDateFromShift(8)
		const buffer = await createBuffer({
			strategy: bufferStrategy,
			size: 60000,
			moment: initDate,
		})

		const dataMap = buffer.getDatamap(datamapDate)

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

		buffer.length.should.equal(120)
	})
})
