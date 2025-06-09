<template>
	<y-pannel>
		<div class="pa-2">
			<div v-if="dataMap === null || !selectedObject3D">No Content</div>
			<div v-else>
				<div>{{ selectedObject3D.name }}</div>
				<div class="d-flex" v-if="columnList[0].length > 1">
					<div>
						<div
							:key="i"
							:style="i > 0 ? { borderTop: 0 } : {}"
							v-for="(key, i) in columnList[0]"
							class="d-flex justify-center border-light-alpha-40 px-2"
						>
							{{ key }}
						</div>
					</div>
					<div>
						<div
							:key="i"
							:style="i > 0 ? { borderLeft: 0, borderTop: 0 } : { borderLeft: 0 }"
							v-for="(value, i) in columnList[1]"
							class="d-flex justify-center border-light-alpha-40 px-2"
						>
							{{ value }}
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
const { dataMap, selectedObject3D, view } = storeToRefs(store)

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
