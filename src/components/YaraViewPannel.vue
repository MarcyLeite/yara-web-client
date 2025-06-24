<template>
	<y-pannel>
		<div class="pa-2 d-flex flex-column ga-4">
			<view-selector :store="store" />
			<y-pannel>
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
