<template>
	<div class="yara">
		<three-js />
	</div>
</template>

<script setup lang="ts">
import '@/assets/style/yara.scss'
import { useYaraStore } from '@/stores/yara-store'

const yaraStore = useYaraStore()

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
</script>
