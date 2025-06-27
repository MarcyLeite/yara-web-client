<template>
	<y-pannel>
		<div class="pa-2" style="width: 12rem">
			<div class="d-flex flex-column ga-3">
				<div class="text-bold text-truncate">
					{{ yara3DState.selectedObject?.name ?? 'No Seletion' }}
				</div>

				<div v-if="yara3DState.selectedObject" class="d-flex flex-column ga-2">
					<y-divider />
					<div class="d-flex justify-end py-2 text-subtitle-2">
						<y-btn type="flat" @click="() => {}"> hide </y-btn>
					</div>
					<div class="px-2 d-flex flex-column ga-2">
						<div class="d-flex justify-space-between">
							<div class="text-bold">Value</div>
							<div v-if="componentState">
								{{
									typeof componentState.value === 'number'
										? componentState.value.toFixed(2)
										: componentState.value
								}}
							</div>
						</div>

						<div
							class="d-flex align-strech border-light-alpha-40 rounded-lg"
							v-if="columnList[0].length > 1"
						>
							<div class="d-flex flex-column grow-1">
								<div
									:key="i"
									:style="{
										borderTop: 0,
										borderLeft: 0,
										borderBottom: columnList[0].length - 1 === i ? 0 : undefined,
									}"
									v-for="(key, i) in columnList[0]"
									class="d-flex justify-center border-light-alpha-40 px-2"
								>
									{{ key }}
								</div>
							</div>
							<div class="d-flex flex-column grow-1">
								<div
									:key="i"
									:style="{
										borderTop: 0,
										borderLeft: 0,
										borderRight: 0,
										borderBottom: columnList[1].length - 1 === i ? 0 : undefined,
									}"
									v-for="(value, i) in columnList[1]"
									class="d-flex justify-center border-light-alpha-40 px-2"
								>
									{{ value }}
								</div>
							</div>
						</div>
						<div class="d-flex flex-column justify-space-between ga-2">
							<div class="text-bold">Formula</div>
							<div
								class="grow-1 bg-panel px-2 rounded-lg outline-light-alpha-40"
								style="text-wrap: wrap; overflow: visible"
							>
								{{ componentConfig?.compute ?? '-' }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</y-pannel>
</template>

<script setup lang="ts">
import type { ComponentState, ViewComponentConfig } from '@/modules/view'
import type { YaraStore } from '@/stores/yara-store'
import { storeToRefs } from 'pinia'

type Props = {
	store: YaraStore
}

const { store } = defineProps<Props>()
const yara3DState = store.yara3DState
const { selectedView, stateMap } = storeToRefs(store)

const componentConfig = ref<ViewComponentConfig | null>(null)

const componentState = ref<ComponentState | null>(null)
const columnList = ref<[string[], unknown[]]>([[], []])

watch([selectedView, stateMap, () => yara3DState.selectedObject], () => {
	columnList.value = [[], []]
	const selectedObject = yara3DState.selectedObject
	if (!selectedView.value || !stateMap.value || !selectedObject) {
		return
	}
	componentConfig.value = store.componentConfigMap
		? store.componentConfigMap[selectedObject.name]
		: null
	componentState.value = stateMap.value[selectedObject.name]
	if (!componentState.value) return
	const filteredDataMap = componentState.value.dataMap

	columnList.value = Object.entries(filteredDataMap).reduce(
		(list, [key, value]) => {
			list[0].push(key)
			list[1].push(value.eng)
			return list
		},
		[['index'], ['eng']] as [string[], unknown[]]
	)
})
</script>
