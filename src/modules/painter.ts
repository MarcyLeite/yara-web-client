import type { ConsumerUpdater } from './consumer-updater'
import type { ComponentColorMap, View } from './view'
import type { Yara3D } from './scene3D/yara-3d'

export const createPainter = (consumerUpdater: ConsumerUpdater, view: View, yara3D: Yara3D) => {
	let colorMap: ComponentColorMap = {}
	const painter = {
		update: () => {
			const differece = consumerUpdater.differenceDataMap
			if (!differece) return
			colorMap = view.components.getColorMap(differece)

			yara3D.paint(colorMap)
		},

		refresh: () => {
			const snapshot = consumerUpdater.fixedDataMap ?? {}
			colorMap = view.components.getColorMap(snapshot)

			for (const id of view.components.idList) {
				if (colorMap[id]) continue
				colorMap[id] = {
					value: null,
					color: '#000000',
				}
			}

			yara3D.paint(colorMap)
		},
		reset: () => {
			yara3D.reset(view)
		},

		get colorMap() {
			return colorMap
		},
	}

	return painter
}

export type Painter = ReturnType<typeof createPainter>
