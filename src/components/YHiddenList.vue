<template>
	<div class="d-flex flex-column ga-4">
		<div class="px-3 d-flex flex-column ga-2">
			<span class="text-subtitle-1 text-bold">Hidden Components</span>
		</div>

		<div class="px-4 d-flex flex-column text-subtitle-2" style="height: 15rem; overflow: scroll">
			<div v-for="(objectName, i) in yara3DState.hiddenList" :key="i">
				<y-divider v-if="i > 0" />
				<div class="py-2 d-flex align-center justify-space-between ga-2">
					<div class="text-truncate">{{ objectName }}</div>

					<y-btn
						type="flat"
						@click="
							() => {
								store.yara3D?.toggleObjectVisible(objectName, true)
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
const { yara3DState } = storeToRefs(store)
</script>
