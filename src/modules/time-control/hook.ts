import { useCallback, useEffect, useRef, useState } from 'react'

export const useTimeControl = (initialDate: Date) => {
	const moment = useRef(initialDate)

	const [isPaused, setPaused] = useState(true)
	const [speed, setSpeed] = useState(1)

	const goTo = useCallback((date: Date) => {
		moment.current = date
	}, [])
	const goToward = useCallback(
		(value: number) => {
			const towardMoment = new Date(moment.current.getTime() + value * 1000)
			goTo(towardMoment)
		},
		[moment, goTo]
	)
	const togglePlay = () => {
		setPaused(!isPaused)
	}

	const prevFrame = useRef(0)
	const frameId = useRef(0)

	const animate = useCallback(
		(currentFrame: number) => {
			const delta = currentFrame - prevFrame.current
			prevFrame.current = currentFrame

			if (!isPaused) {
				const now = new Date()
				if (moment.current.getTime() > now.getTime()) moment.current = now
				else moment.current = new Date(moment.current.getTime() + delta * speed)
			}

			frameId.current = requestAnimationFrame(animate)
		},
		[isPaused, speed]
	)

	useEffect(() => {
		frameId.current = requestAnimationFrame(animate)
		return () => cancelAnimationFrame(frameId.current)
	}, [animate])

	return {
		moment,
		isPaused,
		togglePlay,
		speed,
		setSpeed,
		goTo,
		goToward,
	}
}

export type TimeControl = ReturnType<typeof useTimeControl>
