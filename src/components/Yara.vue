<template>
	<div class="yara p-relative">
		<overlay>
			<datamap-visualizer :store="yaraStore" />
		</overlay>
		<three-js :store="yaraStore" @select="yaraStore.setSelectedObject" />
	</div>
</template>

<script setup lang="ts">
import '@/assets/style/yara.scss'
import { useYaraStore } from '@/stores/yara-store'

const yaraStore = useYaraStore()

const interval = setInterval(() => {
	yaraStore.setMoment(new Date(yaraStore.currentMoment.getTime() + 1000))
}, 1000)

onMounted(() => {
	yaraStore.setConfig({
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

	yaraStore.loop.start()
	yaraStore.setView(0)
})

onUnmounted(() => {
	clearInterval(interval)
	yaraStore.loop.stop()
	yaraStore.$dispose()
})
</script>
