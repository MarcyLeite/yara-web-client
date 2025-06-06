<template>
	<pannel>
		<div class="d-flex flex-column pa-3">
			<div class="d-flex ga-2 text-subtitle-1 justify-center">
				<div class="text-capitalize">{{ month }}</div>
				<div>{{ day }}</div>
				<div>{{ year }}</div>
			</div>
			<div class="text-h4">{{ time }}</div>
			<div :class="['d-flex justify-center align-center ga-2']">
				<div :class="{ 'text-live': isLive, 'text-not-live': !isLive }">
					<y-icon size="1rem" :path="mdiCircle" />
				</div>
				<span>Live</span>
			</div>
		</div>
	</pannel>
</template>

<script setup lang="ts">
import { mdiCircle } from '@mdi/js'
const LOCALE = 'pt-BR'

const datetime = defineModel({ default: new Date() })
const day = computed(() => datetime.value.toLocaleDateString(LOCALE, { day: '2-digit' }))
const month = computed(() =>
	datetime.value.toLocaleDateString(LOCALE, { month: 'short' }).replace('.', '')
)
const year = computed(() => datetime.value.toLocaleDateString(LOCALE, { year: 'numeric' }))

const time = computed(() => datetime.value.toLocaleTimeString(LOCALE))
const isLive = computed(() => datetime.value.getTime() + 5000 >= Date.now())
</script>
