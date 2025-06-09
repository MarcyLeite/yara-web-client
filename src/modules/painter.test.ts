import Sinon from 'sinon'
import { mockView } from '../../tests/utils/mock-view'
import { createPainter } from './painter'
import { type Yara3D } from './scene3D/yara-3d'
import { ComponentColorMap } from './view'

describe('[Service] Integration painter', () => {
	const emtpyObject = {} as any
	const emptySpy = Sinon.spy()
	const paintSpy = Sinon.spy()
	const resetSpy = Sinon.spy()
	const yara3D: Yara3D = {
		fps: 0,
		renderer: emtpyObject,
		resizeObserver: emtpyObject,
		paint: paintSpy,
		reset: resetSpy,
		dispose: emptySpy,
	}

	const mockConsumerUpdater = {
		fixedDataMap: {} as any,
		differenceDataMap: {} as any,
		view: mockView,
		setMoment: emptySpy,
		dispose: emptySpy,
	}

	beforeEach(() => {
		paintSpy.resetHistory()
		resetSpy.resetHistory()

		mockConsumerUpdater.fixedDataMap = {
			foo: {
				eng: 10,
			},
			bar: {
				eng: 40,
			},
		}
		mockConsumerUpdater.differenceDataMap = {
			bar: {
				eng: 40,
			},
		}
	})

	it('Should refresh all colors', () => {
		const painter = createPainter(mockConsumerUpdater, mockView, yara3D)
		painter.refresh()
		const colorMap: ComponentColorMap = paintSpy.args[0][0]

		colorMap.should.haveOwnProperty('0')
		colorMap.should.haveOwnProperty('1')
	})

	it('Should paint only the difference', () => {
		const painter = createPainter(mockConsumerUpdater, mockView, yara3D)
		painter.update()
		const colorMap: ComponentColorMap = paintSpy.args[0][0]

		colorMap.should.not.haveOwnProperty('0')
		colorMap.should.haveOwnProperty('1')
	})

	it('Should paint components black when refreshing color without complete fixedDataMap', () => {
		delete mockConsumerUpdater.fixedDataMap['foo']
		const painter = createPainter(mockConsumerUpdater, mockView, yara3D)
		painter.refresh()
		const colorMap: ComponentColorMap = paintSpy.args[0][0]

		colorMap.should.haveOwnProperty('0')
		colorMap.should.haveOwnProperty('1')

		if (!colorMap['0'] || !colorMap['1']) return

		colorMap['0'].should.eql('#000000')
		colorMap['1'].should.not.eql('#000000')
	})
})
