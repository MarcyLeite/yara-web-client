<template>
	<div class="d-flex flex-column ga-4">
		<div class="px-3 d-flex flex-column ga-2">
			<span class="text-subtitle-1 text-bold">Hidden Components</span>
		</div>

		<div
			class="px-4 d-flex flex-column text-subtitle-2"
			style="max-height: 20rem; overflow: scroll"
		>
			<div class="text-light-alpha-50" v-if="hiddenObjectList.length === 0">None</div>
			<div v-else v-for="(objectName, i) in hiddenObjectList" :key="i">
				<y-divider v-if="i > 0" />
				<div class="py-2 d-flex align-center justify-space-between ga-2">
					<div class="text-truncate">{{ objectName }}</div>

					<y-btn
						type="flat"
						@click="
							() => {
								const index = hiddenObjectList.findIndex((n) => n === objectName)
								hiddenObjectList.splice(index, 1)
							}
						"
					>
						<div>show</div>
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
