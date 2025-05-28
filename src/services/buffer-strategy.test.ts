import Sinon from 'sinon'
import {
	createMockConnection,
	compareSnapshotInRange,
	createDateFromShift,
} from '../../tests/utils/mock-connection'
import { createBufferStrategy } from './buffer-strategy'

describe('[Service] Buffer Strategy', () => {
	const { mockConnection } = createMockConnection()

	const bufferStrategy = createBufferStrategy(mockConnection, ['A', 'B', 'C', 'D'])

	const restartSpy = Sinon.spy(bufferStrategy, 'restart')
	const forwardSpy = Sinon.spy(bufferStrategy, 'forward')

	beforeEach(() => {
		restartSpy.resetHistory()
		forwardSpy.resetHistory()
	})

	it('Should create full buffer given range', async () => {
		const initDate = createDateFromShift(5)
		const finalDate = createDateFromShift(15)

		const snapshotList = await bufferStrategy.restart(initDate, finalDate)

		compareSnapshotInRange(snapshotList, mockConnection, initDate, finalDate)
	})

	it('Should create full buffer given a previous created snapshotList', async () => {
		const firstInitDate = createDateFromShift(5)
		const firstFinalDate = createDateFromShift(15)

		const firstSnapshotList = await bufferStrategy.restart(firstInitDate, firstFinalDate)

		const initDate = createDateFromShift(10)
		const finalDate = createDateFromShift(20)

		const snapshotList = await bufferStrategy.forward(firstSnapshotList, initDate, finalDate)

		compareSnapshotInRange(snapshotList, mockConnection, initDate, finalDate)
	})

	it('Should update use restart method', async () => {
		const from = createDateFromShift(5)
		const to = createDateFromShift(15)

		await bufferStrategy.update({ from, to })

		restartSpy.callCount.should.equal(1)
		forwardSpy.callCount.should.equal(0)
	})
	it('Should update use forward method when update to a new moment in range', async () => {
		const firstFrom = createDateFromShift(5)
		const firstTo = createDateFromShift(15)

		const snapshotList = await bufferStrategy.update({ from: firstFrom, to: firstTo })

		const from = createDateFromShift(10)
		const to = createDateFromShift(20)

		await bufferStrategy.update({ from, to, snapshotList })

		restartSpy.callCount.should.equal(1)
		forwardSpy.callCount.should.equal(1)
	})
	it('Should update use restart method when update to a new moment after last data from snapshot', async () => {
		const firstFrom = createDateFromShift(5)
		const firstTo = createDateFromShift(15)

		const snapshotList = await bufferStrategy.update({ from: firstFrom, to: firstTo })

		const from = createDateFromShift(20)
		const to = createDateFromShift(30)

		await bufferStrategy.update({ from, to, snapshotList })

		restartSpy.callCount.should.equal(2)
		forwardSpy.callCount.should.equal(0)
	})
	it('Should update use restart method when update to a new moment before first data from snapshot', async () => {
		const firstFrom = createDateFromShift(10)
		const firstTo = createDateFromShift(20)

		const snapshotList = await bufferStrategy.update({ from: firstFrom, to: firstTo })

		const from = createDateFromShift(5)
		const to = createDateFromShift(9)

		await bufferStrategy.update({ from, to, snapshotList })

		restartSpy.callCount.should.equal(2)
		forwardSpy.callCount.should.equal(0)
	})
})
