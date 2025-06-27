import { createBuffer } from './buffer'
import type { BufferStrategy } from './buffer-strategy'
import type { Buffer } from './buffer'

export type Consumer = {
	getBuffer: () => Buffer
	setMoment: (moment: Date) => void
	start: () => void
	finish: () => void
	dispose: () => void
}

export const createConsumer = async (
	bufferStrategy: BufferStrategy,
	initialDate: Date,
	bufferSize: number
): Promise<Consumer> => {
	let buffer = await createBuffer({
		strategy: bufferStrategy,
		size: bufferSize,
		moment: initialDate,
	})

	let currentMoment = initialDate
	const setMoment = (moment: Date) => {
		const prev = currentMoment

		if (moment.getTime() === prev.getTime()) {
			return
		}

		currentMoment = moment
	}

	let timout: number | undefined
	let running = false

	const consumerLoopCallback = async () => {
		buffer = await buffer.update({ moment: new Date(currentMoment.getTime() - 10000) })
		if (!running) return
		timout = setTimeout(consumerLoopCallback, 100)
	}

	const start = () => {
		running = true
		consumerLoopCallback()
	}

	const finish = () => {
		running = false
	}

	const dispose = () => {
		finish()
		clearTimeout(timout)
	}

	return {
		getBuffer: () => buffer,
		setMoment,
		start,
		finish,
		dispose,
	}
}
