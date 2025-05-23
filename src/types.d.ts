/**
 * Abstraction of strategies to consume a database and store in a buffer.
 */
type BufferStrategy = {
	/**
	 * @async
	 * It will populate a SnapshotMap without using any previous values
	 * @param moment Reference date for initial values (It will bring all last values before this date)
	 * @returns SnapshotMap
	 */
	restart: (initialDate: Date, range: Date) => Promise<SnapshotMap>
	/**
	 * @async
	 * It will populate a SnapshotMap using previous loaded SnapshotMap
	 * @param snapshotMap previous lodaded SnapshotMap
	 * @param moment Reference date for initial values (It will be calculated from given snapshotMap)
	 * @returns SnapshotMap
	 */
	forward: (snapshotMap: SnapshotMap, moment: Date) => Promise<SnapshotMap>
}

/**
 * Abstraction of Buffer used to make database consuption efficient
 */
type Buffer = {
	/**
	 * @async
	 * It will generate new buffer from a datetime using given strategy. It will use restart strategy
	 * function if moment is before the first or after the last moment saved in itself. Otherwise, it
	 * will use forward funciton
	 * @param moment Reference date for initial values
	 * @param strategy BufferStrategy to be used
	 * @returns A new generated buffer with values updated
	 */
	update: (moment: Date, strategy: BufferStrategy) => Promise<Buffer>
	/**
	 * @async
	 * It will return a ObjectMap if of all last registries from given moment.
	 * @param moment Reference date for initial values
	 * @returns ObjectMap
	 */
	snapshot: (moment: Date) => DataMap
}

/**
 * Abstraction of a Consumer that will create a buffer and updated based on time
 */
type Consumer = {
	/**
	 * get dataMap from buffer on setted moment
	 * @returns DataMap
	 */
	getDataMap: () => DataMap
	/**
	 * Sets internal moment, updated buffer and result from getDataMap
	 * @param moment Given moment
	 */
	setMoment: (moment: Date) => void
	/**
	 * Stop javascript interval
	 * @returns
	 */
	cleanup: () => void
}

/**
 * Color string in Hexcode
 */
type HexColor = string

/**
 * ColorMapper type abstraction
 */
type ColorMapperType = {
	/**
	 * @property type fix string for each implementaition
	 */
	type: string
	/**
	 * Calculates color given generic data
	 * @param genericData
	 * @returns ColorString
	 */
	getColor: (genericData: GenericData) => HexColor
}
/**
 * Color map that recieves thermal input and return between a blue/red color range
 */
type ColorMapperThermal = {
	type: 'thermal'
} & ColorMapperType

/**
 * Every Color Mapper registered
 */
type ColorMapper = ColorMapperThermal

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
type ViewConfig = {
	/**
	 * @property name that will be displayed in app
	 */
	display: string
	/**
	 * @property list of component configuration
	 */
	components: ViewComponentConfig[]
}

/**
 * Object reference that stores Object3D id and color string
 */
type ComponentColorMap = Record<string, HexColor>

/**
 * Stores data of current selected view to be used in page
 */
type View = {
	/**
	 * @property fix string type of the color mapper used
	 */
	type: ColorMapper['type']
	/**
	 * @property string to be displayed in app
	 */
	display: ViewConfig['display']
	/**
	 * @property interactive component properties
	 */
	components: {
		/**
		 * @property string list of Object3D ids
		 */
		hidden: string[]
		/**
		 *
		 * @param dataMap Generic data. Usually setted by connection and current time
		 * @returns list of component-color map
		 */
		getComponentColorMap: (dataMap: DataMap) => ComponentColorMap
	}
	/**
	 * @property list of indexers that will define connection queries
	 */
	dataIndexerList: string[]
}

/**
 * Yara app storage
 */
type StoreHook = {
	/**
	 * @property current selected view
	 */
	view: View

	/**
	 * @property current selected consumer
	 */
	consumer: Consumer

	/**
	 * @property current moment
	 */
	moment: Date

	/**
	 * @property current component-color map from current date
	 */
	componentColorMap: ComponentColorMap
}
