<template>
	<div>Yara Component</div>
</template>

<script setup lang="ts">
import { useYaraStore } from '@/stores/yara-store'
import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'

const yaraStore = useYaraStore()
const storeRef = storeToRefs(yaraStore)
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
						indexerList: ['A'],
					},
				],
			},
		],
	})

	yaraStore.setView(0)
})

setInterval(() => {
	yaraStore.setMoment(new Date(yaraStore.currentMoment.getTime() + 1000))
}, 1000)

watch([storeRef.colorMap], () => {
	console.log(yaraStore.colorMap)
})
</script>
