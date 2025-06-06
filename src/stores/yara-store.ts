import type { DataMap } from '@/services/buffer'
import { createBufferStrategy } from '@/services/buffer-strategy'
import type { Config } from '@/services/configuration'
import { createConnection, type Connection } from '@/services/connection'
import { createConsumer, type Consumer } from '@/services/consumer'
import { createView, type ComponentColorMap, type View } from '@/services/view'
import { defineStore } from 'pinia'
import type { Object3D } from 'three'

type Optional<T extends unknown> = T | null

const BUFFER_SIZE = 60000

export const useYaraStore = defineStore('yara-store', () => {
	const initialDate = new Date(import.meta.env.INITIAL_DATE)

	const config = ref<Optional<Config>>(null)
	const selectedViewIndex = ref<Optional<number>>(null)
	const currentMoment = ref(initialDate)
	const selectedObject = ref<Optional<Object3D>>(null)

	const setConfig = (_config: Config) => {
		config.value = _config
	}
	const setView = (index: number | null) => {
		selectedViewIndex.value = index
	}
	const setMoment = (moment: Date) => {
		if (moment.getTime() > new Date().getTime()) moment = new Date()
		const prev = currentMoment.value
		currentMoment.value = moment
		if (!view.value || !consumer.value || moment.getTime() === prev.getTime()) {
			return
		}

		const _dataMap = consumer.value.getDifference(prev, moment)

		dataMap.value = _dataMap
		colorMap.value = view.value.components.getColorMap(_dataMap)
	}

	const setSelectedObject = (object3d: Object3D | null) => {
		selectedObject.value = object3d
	}

	const refreshColorMap = () => {
		if (!consumer.value || !view.value) return
		const _dataMap = consumer.value.getSnapshot(currentMoment.value)
		dataMap.value = _dataMap

		colorMap.value = view.value.components.getColorMap(_dataMap)
	}

	const connection = ref<Optional<Connection>>(null)
	const view = ref<Optional<View>>(null)
	const consumer = ref<Optional<Consumer>>(null)

	const loadingMessage = ref<Optional<string>>(null)
	const colorMap = ref<Optional<ComponentColorMap>>(null)
	const dataMap = ref<Optional<DataMap>>(null)

	const selectedDataMap = ref<Optional<DataMap>>(null)

	watch([dataMap, selectedObject], () => {
		if (!dataMap.value || !selectedObject.value || !view.value) {
			selectedDataMap.value = null
			return
		}
		selectedDataMap.value = view.value.components.extactFromDataMap(
			selectedObject.value.name,
			dataMap.value
		)
	})

	watch([config], () => {
		if (!config.value) {
			loadingMessage.value = 'Creating connection...'
			connection.value = null
			return
		}
		connection.value = createConnection(config.value.connection)
	})

	watch([selectedViewIndex, connection], async () => {
		if (selectedViewIndex.value === null || !config.value || !connection.value) {
			view.value = null
			consumer.value = null
			return
		}

		const _view = createView(config.value.views[selectedViewIndex.value])
		view.value = _view
		const bufferStrategy = createBufferStrategy(connection.value, _view.dataIndexerList)
		const _consumer = await createConsumer(bufferStrategy, currentMoment.value, BUFFER_SIZE)
		consumer.value = _consumer

		refreshColorMap()
	})

	let timout: number | undefined

	const consumerLoopCallback = async () => {
		if (!consumer.value) {
			timout = setTimeout(consumerLoopCallback, 250)
			return
		}

		consumer.value = await consumer.value.update(currentMoment.value)
		timout = setTimeout(consumerLoopCallback, 250)
	}

	const loop = {
		get status() {
			return timout === null ? 'OFF' : 'ON'
		},
		start: () => {
			consumerLoopCallback()
		},
		stop: () => {
			clearTimeout(timout)
			timout = undefined
		},
	}

	return {
		config,
		view,
		loadingMessage,
		currentMoment,
		refreshColorMap,
		dataMap,
		selectedObject,
		selectedDataMap,
		colorMap,
		setConfig,
		setView,
		setMoment,
		setSelectedObject,
		loop,
	}
})

export type YaraStore = ReturnType<typeof useYaraStore>
