<template>
	<div class="yara p-relative">
		<y-overlay>
			<template #top-left>
				<view-selector :store="yaraStore" />
			</template>

			<template #top-right>
				<datamap-visualizer :store="yaraStore" />
			</template>
			<template #bottom-left>
				<time-controller :store="yaraStore" />
			</template>
		</y-overlay>
		<three-js :store="yaraStore" />
	</div>
</template>

<script setup lang="ts">
import '@/assets/style/yara.scss'
import { useYaraStore } from '@/stores/yara-store'
import axios from 'axios'

const yaraStore = useYaraStore()

onMounted(async () => {
	const response = await axios.get('config.json')
	yaraStore.setConfig(response.data)
})

onUnmounted(() => {
	yaraStore.dispose()
	yaraStore.$dispose()
})
</script>
