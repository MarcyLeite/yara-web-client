<template>
	<div class="yara p-relative">
		<y-overlay>
			<template #top-left>
				<div>
					<yara-view-pannel :store="yaraStore" />
				</div>
			</template>
			<template #bottom>
				<div class="text-light-alpha-50">
					{{ ['Yara', mode === 'production' ? '' : mode].join(' ') }}
					<a
						:href="`https://github.com/MarcyLeite/yara-web-client/releases/tag/v${version}`"
						target="_blank"
					>
						{{ `v${version}` }}
					</a>
					- By <a href="https://github.com/MarcyLeite"> Matheus Marciano </a>
				</div>
			</template>
			<template #top-right>
				<datamap-visualizer :store="yaraStore" />
			</template>
			<template #bottom-left>
				<div class="d-flex flex-column ga-4">
					<y-interaction-section :store="yaraStore" />
					<time-controller :store="yaraStore" />
				</div>
			</template>
			<template #bottom-right> </template>
		</y-overlay>
		<three-js :store="yaraStore" />
	</div>
</template>

<script setup lang="ts">
import '@/assets/style/yara.scss'
import { useYaraStore } from '@/stores/yara-store'
import axios from 'axios'

const mode = import.meta.env.MODE
const version = import.meta.env.VERSION

const yaraStore = useYaraStore()

onMounted(async () => {
	const response = await axios.get(`${import.meta.env.API_PATH}config.json`)
	yaraStore.setConfig(response.data)
})

onUnmounted(() => {
	yaraStore.dispose()
	yaraStore.$dispose()
})
</script>
