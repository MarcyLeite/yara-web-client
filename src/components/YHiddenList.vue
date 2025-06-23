<template>
	<y-pannel>
		<div class="pa-2 text-subtitle-2">
			<div class="d-flex align-center ga-2" v-for="(objectName, i) in objectList" :key="i">
				<y-btn
					:icon="hiddenObjectList.includes(objectName) ? mdiEyeClosed : mdiEye"
					@click="
						() => {
							const index = hiddenObjectList.findIndex((n) => n === objectName)
							if (index === -1) {
								hiddenObjectList.push(objectName)
							} else {
								hiddenObjectList.splice(index, 1)
							}
						}
					"
				></y-btn>
				<div>{{ objectName }}</div>
			</div>
		</div>
	</y-pannel>
</template>

<script setup lang="ts">
import type { YaraStore } from '@/stores/yara-store'
import { mdiEye, mdiEyeClosed } from '@mdi/js'
import { storeToRefs } from 'pinia'

type Props = {
	store: YaraStore
}

const { store } = defineProps<Props>()
const { yara3d, hiddenObjectList } = storeToRefs(store)

const objectList = ref<string[]>([])

watch([yara3d], () => {
	if (!yara3d.value) {
		objectList.value = []
		return
	}

	objectList.value = yara3d.value.objectIdList
})
</script>
