<template>
	<div class="px-3 d-flex flex-column ga-4">
		<div class="d-flex flex-column ga-2">
			<span class="text-subtitle-1">Hidden Components</span>
		</div>
		<div class="d-flex flex-column" v-if="hiddenObjectList.length > 0">
			<div v-for="(objectName, i) in hiddenObjectList" :key="i">
				<y-divider />
				<div class="py-2 d-flex align-center justify-space-between ga-2">
					<div>{{ objectName }}</div>
					<y-btn
						@click="
							() => {
								const index = hiddenObjectList.findIndex((n) => n === objectName)
								hiddenObjectList.splice(index, 1)
							}
						"
					>
						<div class="text-subtitle-2 text-light-alpha-70">show</div>
					</y-btn>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { YaraStore } from '@/stores/yara-store'
import { storeToRefs } from 'pinia'

type Props = {
	store: YaraStore
}

const { store } = defineProps<Props>()
const { hiddenObjectList } = storeToRefs(store)
</script>
