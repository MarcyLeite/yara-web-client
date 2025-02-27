import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { createLinkedBuffer, takeSnapshot, YaraBuffer } from './buffer'
import { YaraView } from '../views/factory'
import { YaraConnection, YaraDataMap } from './connection'

const shiftMoment = (dateTime: Date, shift: number) => new Date(dateTime.getTime() + shift * 1000)

export const useConsumer = (
	momentRef: MutableRefObject<Date>,
	view: YaraView | null,
	connection: YaraConnection | null
) => {
	const backwardSize = useRef(20)
	const forwardSize = useRef(20)

	const buffer = useRef<YaraBuffer | null>(null)

	const dataMapTimestamp = useRef(0)
	const [dataMap, setDatamap] = useState<YaraDataMap>({})

	const updateBuffer = useCallback(async () => {
		if (!view || !connection) {
			buffer.current = null
			return
		}

		buffer.current = await createLinkedBuffer(
			connection,
			view.dataIndexerList,
			shiftMoment(momentRef.current, -backwardSize.current),
			shiftMoment(momentRef.current, forwardSize.current)
		)
	}, [connection, view, momentRef])

	const tickBufferTimeout = useRef<NodeJS.Timeout | null>(null)

	const tickBuffer = useCallback(async () => {
		await updateBuffer()

		if (tickBufferTimeout.current) clearTimeout(tickBufferTimeout.current)
		tickBufferTimeout.current = setTimeout(tickBuffer, 2000)
	}, [updateBuffer])

	const tickDatamap = useCallback(() => {
		return setInterval(() => {
			if (buffer.current) {
				const snapshot = takeSnapshot(buffer.current, momentRef.current)
				if (snapshot.timestamp === dataMapTimestamp.current) return

				dataMapTimestamp.current = snapshot.timestamp
				setDatamap(snapshot.map)
			}
		}, 250)
	}, [momentRef])

	useEffect(() => {
		tickBuffer()

		const dataMapInterval = tickDatamap()

		return () => {
			clearInterval(dataMapInterval)
			if (tickBufferTimeout.current) clearTimeout(tickBufferTimeout.current)
		}
	}, [tickBuffer, tickDatamap])

	return { dataMap } as const
}
