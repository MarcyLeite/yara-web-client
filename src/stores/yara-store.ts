import type { DataMap } from '@/modules/consumer/buffer'
import type { Config } from '@/modules/configuration'
import { createConnection, type Connection } from '@/modules/connection/connection'
import { createConsumerUpdater, type ConsumerUpdater } from '@/modules/consumer-updater'
import { createPainter, type Painter } from '@/modules/painter'
import { type Yara3D } from '@/modules/scene3D/yara-3d'
import { createView, type View } from '@/modules/view'
import type { Optional } from '@/utils/types'
import { defineStore } from 'pinia'
import type { Object3D } from 'three'

const BUFFER_SIZE = 60000

export const useYaraStore = defineStore('yara-store', () => {
	const initialDate = import.meta.env.INITIAL_DATE
		? new Date(import.meta.env.INITIAL_DATE)
		: new Date()
	const moment = ref(initialDate)

	const viewListRef = ref<View[]>([])

	const selectedObject3DRef = ref<Object3D | null>(null)
	const connectionRef = ref<Optional<Connection>>(null)
	const modelPathRef = ref<Optional<string>>(null)

	const dataMapRef = ref<DataMap>({})
	const yara3DRef = ref<Optional<Yara3D>>(null)
	const viewRef = ref<Optional<View>>(null)
	const consumerUpdaterRef = ref<Optional<ConsumerUpdater>>(null)
	const painterRef = ref<Optional<Painter>>(null)

	const setConfig = (newConfig: Config) => {
		viewListRef.value = newConfig.views.map((viewConfig) => createView(viewConfig))
		connectionRef.value = createConnection(newConfig.connection)
		modelPathRef.value = newConfig.modelPath
	}

	const setMoment = (newMoment: Date) => {
		const prev = moment.value
		moment.value = newMoment

		const consumerUpdater = consumerUpdaterRef.value

		if (consumerUpdater) {
			consumerUpdater.setMoment(newMoment)
			dataMapRef.value = consumerUpdater.fixedDataMap ?? {}
		}

		const painter = painterRef.value
		if (!painter || newMoment === prev) return

		if (newMoment > prev) painter.update()
		else painter.refresh()
	}

	const setYara3D = (yara3D?: Yara3D) => {
		yara3DRef.value?.dispose()
		yara3DRef.value = yara3D ?? null
	}

	const setView = async (index: number | null) => {
		const view = viewListRef.value[index ?? -1] ?? null
		viewRef.value = view
	}

	const setSelectedObject3D = (object3D: Object3D | null) => {
		selectedObject3DRef.value = object3D
	}

	watch([viewRef, connectionRef], async () => {
		const view = viewRef.value
		const connection = connectionRef.value
		const yara3D = yara3DRef.value

		painterRef.value?.reset()
		consumerUpdaterRef.value?.dispose()
		yara3D?.reset()

		painterRef.value = null
		consumerUpdaterRef.value = null

		if (!view || !connection || !yara3D) return

		const shiftedDate = new Date(moment.value.getTime() - 10000)
		const consumerUpdater = await createConsumerUpdater(shiftedDate, connection, view, BUFFER_SIZE)
		const painter = createPainter(consumerUpdater, view, yara3D)

		painter.reset()

		consumerUpdater.setMoment(moment.value)
		painter.refresh()

		consumerUpdaterRef.value = consumerUpdater
		dataMapRef.value = consumerUpdater.fixedDataMap ?? {}
		painterRef.value = painter
	})

	const dispose = () => {
		consumerUpdaterRef.value?.dispose()
	}

	return {
		moment,
		modelPath: modelPathRef,
		dataMap: dataMapRef,
		view: viewRef,
		viewList: viewListRef,
		selectedObject3D: selectedObject3DRef,
		setMoment,
		setConfig,
		setYara3D,
		setView,
		setSelectedObject3D,
		dispose,
	}
})

export type YaraStore = ReturnType<typeof useYaraStore>
