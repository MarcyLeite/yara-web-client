<template>
	<pannel>
		<div class="pa-2 d-flex ga-4">
			<clock v-model:model-value="currentMoment" />
			<div class="d-flex grow-1 flex-column align-center pa-4">
				<div class="text-button text-bold">Controller</div>
				<div class="d-flex grow-1 ga-2 align-center">
					<y-btn :icon="mdiRewind10" @click="goTowards(-10)" />
					<y-btn :icon="mdiRewind5" @click="goTowards(-5)" />
					<y-btn :icon="isPaused ? mdiPlay : mdiPause" @click="isPaused = !isPaused" />
					<y-btn :icon="mdiFastForward5" @click="goTowards(5)" />
					<y-btn :icon="mdiFastForward10" @click="goTowards(10)" />
				</div>
			</div>
		</div>
	</pannel>
</template>

<script setup lang="ts">
import type { YaraStore } from '@/stores/yara-store'
import { storeToRefs } from 'pinia'
import {
	mdiRewind10,
	mdiRewind5,
	mdiPlay,
	mdiPause,
	mdiFastForward5,
	mdiFastForward10,
} from '@mdi/js'

type Props = {
	store: YaraStore
}

const { store } = defineProps<Props>()

const { currentMoment } = storeToRefs(store)

const isPaused = ref(false)

const goTowards = (seconds: number) => {
	store.setMoment(new Date(currentMoment.value.getTime() + seconds * 1000))
}

const interval = setInterval(() => {
	if (isPaused.value) return
	store.setMoment(new Date(currentMoment.value.getTime() + 1000))
}, 1000)

onUnmounted(() => {
	clearInterval(interval)
})
</script>
