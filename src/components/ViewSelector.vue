<template>
	<y-pannel>
		<div class="pa-2">
			<div class="d-flex ga-4 align-center text-button">
				VIEW
				<y-select width="10rem" :options="options" :default="-1" @select="onSelect" />
			</div>
		</div>
	</y-pannel>
</template>

<script setup lang="ts">
import type { YaraStore } from '@/stores/yara-store'
import type { Option } from './YSelect.vue'
import { viewToOptions } from '@/modules/view/helper'
import { storeToRefs } from 'pinia'

type Props = {
	store: YaraStore
}

const { store } = defineProps<Props>()
const { viewList } = storeToRefs(store)

const noneOption = { title: 'None', value: -1 }

const options = ref<Option[]>([noneOption])

const onSelect = <T,>(option: T) => {
	const value = option as number
	store.setView(value === -1 ? null : value)
}

const update = () => {
	options.value = [noneOption, ...viewToOptions(viewList.value)]
}

watch([viewList], update)
onMounted(update)
</script>
