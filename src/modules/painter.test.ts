import Sinon from 'sinon'
import { mockView } from '../../tests/utils/mock-view'
import { createPainter } from './painter'
import { type Yara3D } from './scene3D/yara-3d'
import { ComponentColorMap } from './view'
import { WebGLRenderer } from 'three'
import { DataMap } from './consumer/buffer'

describe('[Service] Integration painter', () => {
	const emtpyObject = {}
	const emptySpy = Sinon.spy()
	const paintSpy = Sinon.spy()
	const resetSpy = Sinon.spy()
	const yara3D: Yara3D = {
		fps: 0,
		renderer: emtpyObject as WebGLRenderer,
		resizeObserver: emtpyObject as ResizeObserver,
		resetCamera: emptySpy,
		hideObjects: emptySpy,
		objectIdList: [],
		paint: paintSpy,
		reset: resetSpy,
		dispose: emptySpy,
	}

	const mockConsumerUpdater = {
		fixedDataMap: {} as DataMap,
		differenceDataMap: {} as DataMap,
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

		if (!colorMap['0'].color || !colorMap['1'].color) return

		colorMap['0'].color.should.eql('#000000')
		colorMap['1'].color.should.not.eql('#000000')
	})
})
