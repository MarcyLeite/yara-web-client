import type { Yara3D, Yara3DState } from '@/modules/scene3D/yara-3d'
import type { Config } from '../modules/configuration'
import { defineStore } from 'pinia'
import {
	createView,
	type ComponentStateMap,
	type View,
	type ViewComponentConfig,
} from '@/modules/view'
import { createConsumer, type Consumer } from '@/modules/consumer/consumer'
import { createConnection } from '@/modules/connection/connection'
import { createBufferStrategy } from '@/modules/consumer/buffer-strategy'
import type { Buffer } from '@/modules/consumer/buffer'

const BUFFER_SIZE = 60000
const BACKWARDS_SHIFT = 10000

export const useYaraStore = defineStore('yara-store', () => {
	const initialDate = import.meta.env.INITIAL_DATE
		? new Date(import.meta.env.INITIAL_DATE)
		: new Date()

	const config = ref<Config | null>(null)
	const consumer = ref<Consumer | null>(null)

	const yara3DState = reactive<Partial<Yara3DState>>({})
	const yara3D = ref<Yara3D | null>(null)
	const viewList = ref<View[]>([])

	const selectedView = ref<View | null>(null)
	const moment = ref(new Date(initialDate))
	const buffer = ref<Buffer | null>(null)

	const stateMap = ref<ComponentStateMap | null>(null)
	const componentConfigMap = ref<Record<string, ViewComponentConfig> | null>(null)

	const setMoment = (newMoment: Date) => {
		if (newMoment.getTime() > Date.now()) newMoment = new Date()
		const prev = moment.value
		moment.value = newMoment

		if (prev.getTime() === moment.value.getTime()) return
		if (!consumer.value || !yara3D.value || !selectedView.value) return

		consumer.value.setMoment(moment.value)
		buffer.value = consumer.value.getBuffer()

		const dataMap = buffer.value.getSnapshot(moment.value)
		stateMap.value = selectedView.value.components.getComponentStateMap(dataMap)
		yara3D.value.paint(stateMap.value)
	}

	const setConfig = (newConfig: Config) => {
		config.value = newConfig
		viewList.value = newConfig.views.map((config) => createView(config))
	}
	const setYara3D = (newYara3D: Yara3D) => {
		newYara3D.onStateChange = (prop, value) => {
			yara3DState[prop] = value as never
		}
		yara3D.value = newYara3D
	}

	const setView = async (index?: number) => {
		selectedView.value = index === undefined ? null : (viewList.value[index] ?? null)

		yara3D.value?.reset(selectedView.value)
		consumer.value?.dispose()

		if (!selectedView.value || !yara3D.value || !config.value) return

		componentConfigMap.value = selectedView.value.components.getComponentConfigMap()

		const connection = createConnection(config.value.connection)
		const strategy = createBufferStrategy(connection, selectedView.value.dataIndexerList)

		const shiftDate = new Date(moment.value.getTime() - BACKWARDS_SHIFT)
		consumer.value = await createConsumer(strategy, shiftDate, BUFFER_SIZE)

		consumer.value.setMoment(moment.value)
		buffer.value = consumer.value.getBuffer()

		const dataMap = buffer.value.getSnapshot(moment.value)
		const stateMap = selectedView.value.components.getComponentStateMap(dataMap)
		yara3D.value.paint(stateMap)
	}

	const dispose = () => {
		consumer.value?.dispose()
	}

	return {
		config,
		viewList,
		selectedView,
		moment,
		yara3D,
		stateMap,
		componentConfigMap,
		yara3DState,
		setConfig,
		setYara3D,
		setView,
		setMoment,
		dispose,
	}
})

export type YaraStore = ReturnType<typeof useYaraStore>
