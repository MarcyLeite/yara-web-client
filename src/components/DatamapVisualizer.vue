<template>
	<y-pannel>
		<div class="pa-2" style="width: 12rem">
			<div class="d-flex flex-column ga-3">
				<div class="text-bold text-truncate">
					{{ selectedObject3D?.name ?? 'No Seletion' }}
				</div>

				<div v-if="selectedObject3D" class="d-flex flex-column ga-2">
					<y-divider />
					<div class="d-flex justify-end py-2 text-subtitle-2">
						<y-btn
							type="flat"
							@click="
								() => {
									hiddenObjectList.push(selectedObject3D!.name)
									store.setSelectedObject3D(null)
								}
							"
						>
							hide
						</y-btn>
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
				</div>
			</div>
		</div>
	</y-pannel>
</template>

<script setup lang="ts">
import type { YaraStore } from '@/stores/yara-store'
import { storeToRefs } from 'pinia'

type Props = {
	store: YaraStore
}

const { store } = defineProps<Props>()
const { dataMap, selectedObject3D, view, hiddenObjectList } = storeToRefs(store)

const columnList = ref<[string[], unknown[]]>([[], []])

watch([view, selectedObject3D, dataMap], () => {
	if (!view.value || !selectedObject3D.value) {
		columnList.value = [[], []]
		return
	}
	const filteredDataMap =
		view.value.components.extactFromDataMap(selectedObject3D.value.name, dataMap.value) ?? {}

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
