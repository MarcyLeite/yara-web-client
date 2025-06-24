<template>
	<y-pannel>
		<div class="pa-2 d-flex flex-column ga-4 p-relative" style="max-width: 18rem">
			<div style="position: relative; z-index: 100">
				<view-selector :store="store" />
			</div>
			<y-pannel rounded="lg">
				<y-hidden-list :store="store" />
			</y-pannel>
		</div>
	</y-pannel>
</template>

<script setup lang="ts">
import type { YaraStore } from '@/stores/yara-store'

type Props = {
	store: YaraStore
}

const { store } = defineProps<Props>()
</script>
