import Sinon from 'sinon'
import {
	compareDataMap,
	createDateFromShift,
	createMockConnection,
	INITIAL_DATE,
} from '../../tests/utils/mock-connection'
import { createBufferStrategy } from './buffer-strategy'
import { createConsumer } from './consumer'

const { mockConnection, mockSnapshotList } = createMockConnection()
const bufferStrategy = createBufferStrategy(mockConnection, ['A', 'B', 'C', 'D'])
const consumer = await createConsumer(bufferStrategy, INITIAL_DATE)

describe('[Service] Consumer', () => {
	const bufferSpy = Sinon.spy(bufferStrategy, 'update')

	beforeEach(() => {
		bufferSpy.resetHistory()
	})

	it('Should create consumer', async () => {
		await createConsumer(bufferStrategy, INITIAL_DATE)
		bufferSpy.callCount.should.equal(1)
	})

	it('Should getDatamap from time in buffer', () => {
		const datamapDate = createDateFromShift(25)
		const datamap = consumer.getDatamap(datamapDate)

		compareDataMap(mockSnapshotList, datamap['A'], datamapDate)
		compareDataMap(mockSnapshotList, datamap['B'], datamapDate)
		compareDataMap(mockSnapshotList, datamap['C'], datamapDate)
		compareDataMap(mockSnapshotList, datamap['D'], datamapDate)
	})

	it('Should update consumer using strategy', async () => {
		await consumer.update(createDateFromShift(1))
		bufferSpy.callCount.should.equal(1)
	})
})
