<template>
	<div class="d-flex ga-4 align-center text-button text-bold">
		VIEW
		<y-select width="100%" :options="options" :default="-1" @select="onSelect" />
	</div>
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
	store.setView(value)
}

const update = () => {
	options.value = [noneOption, ...viewToOptions(viewList.value)]
}

watch([viewList], update)
onMounted(update)
onUnmounted(() => {
	store.setView(-1)
})
</script>
