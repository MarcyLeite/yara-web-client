<template>
	<div class="yara">
		<three-js />
	</div>
</template>

<script setup lang="ts">
import '@/assets/style/yara.scss'
import { useYaraStore } from '@/stores/yara-store'
import { storeToRefs } from 'pinia'

const yaraStore = useYaraStore()
const yaraStoreRef = storeToRefs(yaraStore)

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
						id: 'foo',
						indexerList: ['C'],
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

watch([yaraStoreRef.dataMap], () => {})
</script>
