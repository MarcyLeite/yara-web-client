<template>
	<pannel>
		<div class="pa-2">
			<div v-if="dataMap === null || !selectedObject">No Content</div>
			<div v-else>
				<div>{{ selectedObject.name }}</div>
				<div class="d-flex">
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
	</pannel>
</template>

<script setup lang="ts">
import type { YaraStore } from '@/stores/yara-store'
import { storeToRefs } from 'pinia'

type Props = {
	store: YaraStore
}

const { store } = defineProps<Props>()
const { selectedDataMap: dataMap, selectedObject } = storeToRefs(store)

const columnList = ref<[string[], unknown[]]>([[], []])

watch([dataMap], () => {
	if (!dataMap.value) return
	columnList.value = Object.entries(dataMap.value).reduce(
		(list, [key, value]) => {
			list[0].push(key)
			list[1].push(value.eng)
			return list
		},
		[['index'], ['eng']] as [string[], unknown[]]
	)
})
</script>
