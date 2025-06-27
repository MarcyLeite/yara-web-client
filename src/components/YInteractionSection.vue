<template>
	<div>
		<y-btn
			class="pa-3 text-light"
			:icon="mdiCameraFlipOutline"
			bg-color="panel-alpha-80"
			:elevation="1"
			@click="onReset"
		/>
	</div>
</template>

<script setup lang="ts">
import type { YaraStore } from '@/stores/yara-store'
import { mdiCameraFlipOutline } from '@mdi/js'

type Props = {
	store: YaraStore
}

const { store } = defineProps<Props>()

const onReset = () => {
	store.yara3D?.resetCamera()
}
</script>
