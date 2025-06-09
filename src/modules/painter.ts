import type { ConsumerUpdater } from './consumer-updater'
import type { View } from './view'
import type { Yara3D } from './scene3D/yara-3d'

export const createPainter = (consumerUpdater: ConsumerUpdater, view: View, yara3D: Yara3D) => {
	const painter = {
		update: () => {
			const differece = consumerUpdater.differenceDataMap
			if (!differece) return
			const colorMap = view.components.getColorMap(differece)
			yara3D.paint(colorMap)
		},

		refresh: () => {
			const snapshot = consumerUpdater.fixedDataMap ?? {}
			const colorMap = view.components.getColorMap(snapshot)

			for (const id of view.components.idList) {
				if (colorMap[id]) continue
				colorMap[id] = '#000000'
			}

			yara3D.paint(colorMap)
		},
		reset: (mode?: any) => {
			yara3D.reset(mode)
		},
	}

	return painter
}

export type Painter = ReturnType<typeof createPainter>
