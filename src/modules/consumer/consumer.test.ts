import Sinon from 'sinon'
import {
	compareDataMap,
	createDateFromShift,
	createMockConnection,
	INITIAL_DATE,
} from '../../../tests/utils/mock-connection'
import { createBufferStrategy } from './buffer-strategy'
import { createConsumer } from './consumer'

const BUFFER_SIZE = 60000

const { mockConnection, mockSnapshotList } = createMockConnection()
const bufferStrategy = createBufferStrategy(mockConnection, ['A', 'B', 'C', 'D'])
const consumer = await createConsumer(bufferStrategy, INITIAL_DATE, BUFFER_SIZE)

describe('[Service] Consumer', () => {
	const bufferSpy = Sinon.spy(bufferStrategy, 'update')

	beforeEach(() => {
		bufferSpy.resetHistory()
	})

	it('Should create consumer', async () => {
		await createConsumer(bufferStrategy, INITIAL_DATE, BUFFER_SIZE)
		bufferSpy.callCount.should.equal(1)
	})

	it('Should get datamap from time in buffer', () => {
		const datamapDate = createDateFromShift(25)
		const datamap = consumer.getSnapshot(datamapDate)

		compareDataMap(mockSnapshotList, datamap['A'], datamapDate)
		compareDataMap(mockSnapshotList, datamap['B'], datamapDate)
		compareDataMap(mockSnapshotList, datamap['C'], datamapDate)
		compareDataMap(mockSnapshotList, datamap['D'], datamapDate)
	})

	it('Should get difference from given range', async () => {
		const datamapInitDate = createDateFromShift(7)
		const datamapEndDate = createDateFromShift(8)

		const dataMap = consumer.getDifference(datamapInitDate, datamapEndDate)

		compareDataMap(mockSnapshotList, dataMap['A'], datamapEndDate)
		compareDataMap(mockSnapshotList, dataMap['B'], datamapEndDate)
		should.not.exist(dataMap['C'])
		compareDataMap(mockSnapshotList, dataMap['D'], datamapEndDate)
	})

	it('Should update consumer using strategy', async () => {
		await consumer.update(createDateFromShift(1))
		bufferSpy.callCount.should.equal(1)
	})
})
