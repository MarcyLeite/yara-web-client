import getUuidByString from 'uuid-by-string'
import type { DataMap } from '../consumer/buffer'
import type { Connection, ConnectionConfigType, GenericData, Snapshot } from './connection'
import Rand from 'rand-seed'
import { fixValue } from '../../utils/types'
import { getRandomInt } from '../../utils/math'

const RANDOM_SEED_SIZE = 16
const TICK_INVERVAL = 1000

type DemoBehavior = 'hot' | 'cold' | 'walk'

type DemoDataProperties = {
	indexer: string
	behavior: DemoBehavior
	min?: number | null
	max?: number | null
	defaultValue?: number
	chance?: number
	shift?: number
	shiftRange?: boolean
}

/**
 * Demo yara configuration format
 */
export type ConnectionDemoConfig = {
	type: 'demo'
	seed?: string
	dataProperties: DemoDataProperties[]
} & ConnectionConfigType

const generateRandomSeed = () => {
	const numberList = []
	for (let i = 0; i < RANDOM_SEED_SIZE; i++) {
		numberList.push(Math.round(Math.random() * 10))
	}

	return numberList.join('')
}

const fixDataProperties = ({
	indexer,
	behavior,
	min,
	max,
	defaultValue,
	chance,
	shift,
	shiftRange,
}: DemoDataProperties): Required<DemoDataProperties> => ({
	indexer,
	behavior,
	min: fixValue(min, null),
	max: fixValue(max, null),
	defaultValue: fixValue(
		defaultValue,
		typeof max === 'number' && typeof min === 'number' ? max - min / 2 : 50
	),
	chance: fixValue(chance, 0.5),
	shift: fixValue(shift, 1),
	shiftRange: fixValue(shiftRange, false),
})

const generateInitialData = (dataPropertiesList: Required<DemoDataProperties>[]) => {
	const dataMap: DataMap = {}

	for (const { indexer, defaultValue } of dataPropertiesList) {
		dataMap[indexer] = {
			_measurement: indexer,
			eng: defaultValue,
		}
	}

	return dataMap
}

const generateInitialState = (moment: Date, propertiesList: Required<DemoDataProperties>[]) => ({
	date: moment,
	data: Object.entries(generateInitialData(propertiesList)).reduce(
		(map, [key, value]) => {
			map[key] = {
				data: value,
				overflowList: [],
			}
			return map
		},
		{} as State['data']
	),
})

const stateToSnapshotList = ({ date, data }: State, indexerList: string[]): Snapshot[] =>
	Object.values(data).reduce((list, value) => {
		if (indexerList.includes(value.data._measurement as string)) {
			list.push({
				timestamp: date.getTime(),
				data: value.data,
			})
		}
		return list
	}, [] as Snapshot[])

type Difference = { indexer: string; value: number }
type WorkProps = {
	seed: string
	moment: Date
	initialDate: Date
	dataPropertiesList: Required<DemoDataProperties>[]
}
const createDifference = ({
	seed,
	moment,
	initialDate,
	dataPropertiesList,
}: WorkProps): Difference[] => {
	const time = moment.getTime()
	const initialTime = initialDate.getTime()
	const diffTime = time - initialTime

	if (diffTime === 0) {
		return dataPropertiesList.map(({ indexer }) => ({
			indexer,
			value: 0,
		}))
	}

	const fixedSeed = getUuidByString(seed + diffTime)
	const random = new Rand(fixedSeed)

	const generateValue = ({ behavior, chance, shift, shiftRange }: Required<DemoDataProperties>) => {
		if (random.next() >= chance) return 0

		const shiftModifier = !shiftRange ? shift : getRandomInt(1, shift, random.next)
		const behaviorModifier =
			behavior === 'hot' ? 0.75 : behavior === 'cold' ? 0.25 : behavior === 'walk' ? 0.5 : 0.5
		const temperatureModifier = shiftModifier * (random.next() < behaviorModifier ? 1 : -1)

		const modifier = temperatureModifier

		return modifier
	}

	return dataPropertiesList.map((props) => ({
		indexer: props.indexer,
		value: generateValue(props),
	}))
}

type Overflow = { overflow?: boolean; value: number }
type State = {
	date: Date
	data: Record<
		string,
		{
			data: GenericData
			overflowList: Overflow[]
		}
	>
}
const generateStateList = (state: State, props: WorkProps) => {
	const { date: currentDate, data: currentData } = state
	const to = props.moment
	const toTime = to.getTime()
	const currentTime = currentDate.getTime()

	const diffTime = toTime - currentTime

	if (diffTime === 0) {
		return [structuredClone(state)]
	}

	const direction = Math.sign(diffTime)

	const stateDateList: State[] = []
	const currentDataClone = structuredClone(currentData)

	const updateOverflow = (overflowList: Overflow[], isOverflow: boolean) => {
		if (!overflowList[0]) {
			overflowList.unshift({ value: 0 })
		}

		if ((isOverflow && !overflowList[0].overflow) || (!isOverflow && overflowList[0].overflow)) {
			overflowList.unshift({ overflow: isOverflow, value: 0 })
		}

		return overflowList[0]
	}

	const propertiesList = props.dataPropertiesList

	for (let i = 0; i < Math.abs(diffTime); i += TICK_INVERVAL) {
		const stepTime = currentTime + (i + (direction > 0 ? TICK_INVERVAL : 0)) * direction
		const difference = createDifference(Object.assign({}, props, { moment: new Date(stepTime) }))

		for (const { indexer, value } of difference) {
			const data = currentDataClone[indexer].data
			const eng = data.eng as number
			let final = eng + value * direction

			const properties = propertiesList.find((p) => p.indexer === indexer)
			if (!properties) continue

			const { max, min } = properties

			const overflowList = currentDataClone[indexer].overflowList

			if (direction < 0) {
				const overflow = overflowList[0]

				overflow.value -= overflow.overflow ? value : 1
				if (overflow.overflow) final = eng

				if (overflow.value === 0 && overflowList.length > 1) {
					overflowList.shift()
				}
			} else {
				if (max !== null && final > max) {
					const overflow = updateOverflow(overflowList, true)
					overflow.value += value
					final = eng
				} else if (min !== null && final < min) {
					const overflow = updateOverflow(overflowList, true)
					overflow.value += value
					final = eng
				} else {
					const overflow = updateOverflow(overflowList, false)
					overflow.value += 1
				}
			}
			data.eng = final
		}

		stateDateList.push({
			date: new Date(stepTime + (direction < 0 ? -TICK_INVERVAL : 0)),
			data: structuredClone(currentDataClone),
		})
	}

	return stateDateList
}

export const createDemoConnection = ({
	seed,
	dataProperties: dataPropertiesListRaw,
}: ConnectionDemoConfig) => {
	const dataPropertiesList = dataPropertiesListRaw.map((dataProperties) =>
		fixDataProperties(dataProperties)
	)
	seed = seed ?? generateRandomSeed()
	let initialDate: Date
	// let initialDate = initialDateString === 'now' ? new Date() : new Date(initialDateString)
	let currentState: State

	const restart = (date: Date) => {
		if (!initialDate) {
			initialDate = new Date(date)
		}

		if (!currentState) {
			currentState = generateInitialState(date, dataPropertiesList)
		}
	}

	const connection: Connection = {
		getLastDataFrom: async (date, indexerList) => {
			restart(date)
			const stateList = generateStateList(currentState, {
				seed,
				moment: date,
				initialDate,
				dataPropertiesList,
			})

			currentState = stateList[stateList.length - 1]
			return stateToSnapshotList(stateList[stateList.length - 1], indexerList)
		},
		getDataFromRange: async (date1, date2, indexerList) => {
			restart(date1)
			const stateList = generateStateList(currentState, {
				seed,
				moment: date2,
				initialDate,
				dataPropertiesList,
			})

			currentState = stateList[stateList.length - 1]

			const snapshotList: Snapshot[] = []

			for (const state of stateList) {
				if (state.date.getTime() < date1.getTime()) continue
				const stateSnapshotList = stateToSnapshotList(state, indexerList)
				snapshotList.push(...stateSnapshotList)
			}

			return snapshotList
		},
	}

	return connection
}
