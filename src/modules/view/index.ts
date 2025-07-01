import type { GenericType } from '../connection/connection'
import type { DataMap } from '../consumer/buffer'
import { yaraParse } from '../eval'
import type { Yara3DMaterial, Yara3DOptions } from '../scene3D/yara-3d'
import {
	createColorMapper,
	type ColorMapper,
	type ColorMapperOptions,
	type HexColor,
} from './color-mapper'

/**
 * Configuration objects for views
 */
export type ViewComponentConfig = {
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

	material?: Yara3DMaterial

	/**
	 * @property string JS code to compute value
	 */
	compute?: string
}

/**
 * Default view configuration object
 */
export type ViewConfig = {
	/**
	 * @property name that will be displayed in app
	 */
	display: string
	
	scene: Partial<Yara3DOptions>
	/**
	 * @property configuration object for mapper
	 */
	mapper: ColorMapperOptions
	/**
	 * @property list of component configuration
	 */
	components: ViewComponentConfig[]
	/**
	 * @property yara 3d display mode
	 */
}

export type ComponentState = {
	dataMap: DataMap
	value: GenericType | null
	color: HexColor | null
	isHidden: boolean
}
export type ComponentStateMap = Record<string, ComponentState>

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
		 * @property string list of Object3D config
		 */
		config: ViewComponentConfig[]

		getComponentConfigMap: () => Record<string, ViewComponentConfig>
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
		getComponentStateMap: (dataMap: DataMap) => ComponentStateMap
	}
	/**
	 * @property list of indexers that will define connection queries
	 */
	dataIndexerList: string[]
}

const DEFAULT_PROPERTY = 'eng'

export const createView = (config: ViewConfig): View => {
	const dataIndexerList: string[] = []
	const hiddenComponentList: string[] = []
	const idList: string[] = []

	const sceneConfig: Yara3DOptions = {
		material: config.scene?.material ?? 'default'
	}

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

	const getComponentConfigMap = () => {
		return config.components.reduce(
			(map, componentConfig) => {
				map[componentConfig.id] = componentConfig
				return map
			},
			{} as Record<string, ViewComponentConfig>
		)
	}

	const createComponentState = (config: ViewComponentConfig, dataMap: DataMap) => {
		const state: ComponentState = {
			dataMap:
				config.indexerList?.reduce((map, index) => {
					map[index] = dataMap[index]
					return map
				}, {} as DataMap) ?? {},
			isHidden: false,
			color: null,
			value: null,
		}
		if (config.isHidden) {
			state.isHidden = true
			return
		}
		if (config.compute) {
			state.value = yaraParse(config.compute, dataMap, DEFAULT_PROPERTY)
		} else {
			if (!config.indexerList || config.indexerList.length === 0) return
			const indexer = config.indexerList[0]
			const data = dataMap[indexer]
			if (!data) return
			state.value = data[DEFAULT_PROPERTY] ?? null
		}

		state.color = mapper.getColor(state.value)

		return state
	}

	const getComponentStateMap = (dataMap: DataMap) => {
		const stateMap: Record<string, ComponentState> = {}

		for (const componentConfig of config.components) {
			const state = createComponentState(componentConfig, dataMap)
			if (!state) continue
			stateMap[componentConfig.id] = state
		}

		return stateMap
	}

	return {
		display: config.display,
		scene: sceneConfig,
		components: {
			idList,
			config: config.components,
			extactFromDataMap,
			getComponentConfigMap,
			getComponentStateMap,
		},
		dataIndexerList,
	}
}
