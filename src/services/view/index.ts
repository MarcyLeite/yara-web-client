import type { DataMap } from '../buffer'
import type { Yara3DOptions } from '../scene3D/yara-3d'
import {
	createColorMapper,
	type ColorMapper,
	type ColorMapperOptions,
	type HexColor,
} from './color-mapper'

/**
 * Configuration objects for views
 */
type ViewComponentConfig = {
	/**
	 * @property name of Object3D
	 */
	id: string
	/**
	 * @property name to be displayed in app
	 */
	display?: string
	/**
	 * @property hide object in app
	 */
	isHidden?: boolean
	/**
	 * @property list of indexers that will be used to calculate color
	 */
	indexerList?: string[]
}

/**
 * Default view configuration object
 */
export type ViewConfig = {
	/**
	 * @property name that will be displayed in app
	 */
	display: string
	/**
	 * @property configuration object for mapper
	 */
	mapper: ColorMapperOptions
	/**
	 * @property list of component configuration
	 */
	components: ViewComponentConfig[]
}

/**
 * Object reference that stores Object3D id and color string
 */
export type ComponentColorMap = Record<string, HexColor | undefined>

/**
 * Stores data of current selected view to be used in page
 */
export type View = {
	/**
	 * @property string to be displayed in app
	 */
	display: ViewConfig['display']
	/**
	 * @property interactive component properties
	 */

	scene: Yara3DOptions

	components: {
		/**
		 * @property string list of Object3D ids
		 */
		idList: string[]
		/**
		 * @property string list of Object3D ids
		 */
		hidden: string[]

		/**
		 * Extracts only related data from configured object3D
		 * @param componentId object3D component id
		 * @param dataMap original datamap
		 * @returns filtered datamap with only component indexers or null if no componentId found
		 */
		extactFromDataMap: (componentId: string, dataMap: DataMap) => DataMap | null

		/**
		 *
		 * @param dataMap Generic data. Usually setted by connection and current time
		 * @returns list of component-color map
		 */
		getColorMap: (dataMap: DataMap) => ComponentColorMap
	}
	/**
	 * @property list of indexers that will define connection queries
	 */
	dataIndexerList: string[]
}

export const createView = (config: ViewConfig): View => {
	const dataIndexerList: string[] = []
	const hiddenComponentList: string[] = []
	const idList: string[] = []

	for (const { id, indexerList, isHidden } of config.components) {
		idList.push(id)
		if (indexerList) {
			dataIndexerList.push(...indexerList)
		}
		if (isHidden) {
			hiddenComponentList.push(id)
		}
	}

	const mapper: ColorMapper = createColorMapper(config.mapper)

	const extactFromDataMap = (componentId: string, dataMap: DataMap) => {
		const componentConfig = config.components.find((component) => component.id === componentId)
		if (!componentConfig) return null

		const exclusiveDataMap: DataMap = {}
		for (const indexer of componentConfig.indexerList ?? []) {
			const values = dataMap[indexer]
			if (!values) continue
			exclusiveDataMap[indexer] = values
		}

		return exclusiveDataMap
	}

	const getColorMap = (inputDataSet: DataMap) => {
		const colorMap: ComponentColorMap = {}
		for (const componentConfig of config.components) {
			if (componentConfig.isHidden || !componentConfig.indexerList) continue

			const measuarent = componentConfig.indexerList[0]

			if (inputDataSet[measuarent] === undefined) continue

			colorMap[componentConfig.id] = mapper.getColor(inputDataSet[measuarent]?.eng ?? null)
		}

		return colorMap
	}

	return {
		display: config.display,
		scene: mapper.scene,
		components: {
			idList,
			hidden: hiddenComponentList,
			extactFromDataMap,
			getColorMap,
		},
		dataIndexerList,
	}
}
