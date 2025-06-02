import type { DataMap } from '@/services/buffer'
import { createBufferStrategy } from '@/services/buffer-strategy'
import type { Config } from '@/services/configuration'
import { createConnection, type Connection } from '@/services/connection'
import { createConsumer, type Consumer } from '@/services/consumer'
import { createView, type ComponentColorMap, type View } from '@/services/view'
import { defineStore } from 'pinia'

type Optional<T extends unknown> = T | null

const BUFFER_SIZE = 60000

export const useYaraStore = defineStore('yara-store', () => {
	const initialDate = new Date(import.meta.env.INITIAL_DATE)

	const config = ref<Optional<Config>>(null)
	const selectedViewIndex = ref<Optional<number>>(null)
	const currentMoment = ref(initialDate)

	const setConfig = (_config: Config) => {
		config.value = _config
	}
	const setView = (index: number) => {
		selectedViewIndex.value = index
	}
	const setMoment = (moment: Date) => {
		currentMoment.value = moment
	}

	const connection = ref<Optional<Connection>>(null)
	const view = ref<Optional<View>>(null)
	const consumer = ref<Optional<Consumer>>(null)

	const loadingMessage = ref<Optional<string>>(null)
	const colorMap = ref<Optional<ComponentColorMap>>(null)
	const dataMap = ref<Optional<DataMap>>(null)

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
		const bufferStrategy = createBufferStrategy(connection.value, _view.dataIndexerList)
		const _consumer = await createConsumer(bufferStrategy, currentMoment.value, BUFFER_SIZE)

		view.value = _view
		consumer.value = _consumer
	})

	const consumerLoopCallback = async () => {
		if (!consumer.value) {
			setTimeout(consumerLoopCallback, 20)
			return
		}

		consumer.value = await consumer.value.update(currentMoment.value)
		setTimeout(consumerLoopCallback, 20)
	}

	const datamapLoopCallback = () => {
		if (!view.value || !consumer.value) {
			return
		}

		const _dataMap = consumer.value.getDatamap(currentMoment.value)
		dataMap.value = _dataMap
		colorMap.value = view.value.components.getColorMap(_dataMap)
	}

	setInterval(datamapLoopCallback, 1000)
	consumerLoopCallback()

	return { loadingMessage, currentMoment, dataMap, colorMap, setConfig, setView, setMoment }
})
