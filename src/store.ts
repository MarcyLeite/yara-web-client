import { useEffect, useReducer, useState } from 'react'
import { useConfiguration } from './modules/configuration/hook'
import { IndamoConnection } from './modules/consumer/connection'
import { useTimeControl } from './modules/time-control/hook'
import { useView } from './modules/views/hook'
import { createInfluxConnection } from './modules/consumer/influx-connection'
import { useConsumer } from './modules/consumer'
import { Object3D } from 'three'

export const useIndamoStore = () => {
	const configuration = useConfiguration(`${window.location.origin}/indamo-config.json`)
	const viewHook = useView(configuration.views)

	const initialDate = import.meta.env?.DEV ? new Date(import.meta.env.VITE_DEV_DATE) : new Date()
	const timeControl = useTimeControl(initialDate)

	const [connection, setConnection] = useState<IndamoConnection | null>(null)
	const consumer = useConsumer(timeControl.moment, viewHook.view, connection)

	useEffect(() => {
		if (!configuration.connection) {
			setConnection(null)
			return
		}
		setConnection(createInfluxConnection(configuration.connection.options))
	}, [configuration.connection])

	const [component, setComponent] = useState<Object3D | null>(null)
	const [colorMap, updateColorMap] = useReducer((state: Record<string, string>) => {
		if (!viewHook.view) return state
		const newState = Object.assign({}, state)
		for (const { id, color } of viewHook.view.getColorList(consumer.dataMap)) {
			newState[id] = color
		}
		return newState
	}, {})

	useEffect(() => {
		updateColorMap()
	}, [consumer.dataMap, viewHook.view])

	return {
		...viewHook,
		configuration,
		timeControl,
		dataMap: consumer.dataMap,
		colorMap,
		consumer,
		scene: {
			selected: component,
			setSelected: setComponent,
		},
	}
}

export type IndamoStore = ReturnType<typeof useIndamoStore>
export type PropsWithIndamoStore<T = object> = IndamoStore & T
