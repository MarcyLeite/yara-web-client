<template>
	<div class="yara p-relative">
		<overlay>
			<template #top-left>
				<view-selector :store="yaraStore" />
			</template>

			<template #top-right>
				<datamap-visualizer :store="yaraStore" />
			</template>
			<template #bottom-left>
				<time-controller :store="yaraStore" />
			</template>
		</overlay>
		<three-js :store="yaraStore" />
	</div>
</template>

<script setup lang="ts">
import '@/assets/style/yara.scss'
import { useYaraStore } from '@/stores/yara-store'

const yaraStore = useYaraStore()

onMounted(() => {
	yaraStore.setConfig({
		modelPath: 'snowman.glb',
		connection: {
			type: 'influxdb',
			org: 'dev',
			bucket: 'dev',
			token: 'dev-token',
			url: 'http://localhost:8086',
		},
		views: [
			{
				display: 'Thermal',
				mapper: {
					type: 'thermal',
					min: 0,
					max: 100,
				},
				components: [
					{
						id: 'Body3',
						indexerList: ['C'],
					},
					{
						id: 'Body2',
						indexerList: ['B', 'A'],
					},
				],
			},
		],
	})
})

onUnmounted(() => {
	yaraStore.dispose()
	yaraStore.$dispose()
})
</script>
