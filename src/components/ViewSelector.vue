<template>
	<pannel>
		<div class="d-flex ga-4 align-center text-button">
			VIEW
			<y-select width="10rem" :options="options" :default="-1" @select="onSelect" />
		</div>
	</pannel>
</template>

<script setup lang="ts">
import type { YaraStore } from '@/stores/yara-store'
import { storeToRefs } from 'pinia'
import type { Option } from './YSelect.vue'
import { viewConfigToOptions } from '@/services/view/helper'

type Props = {
	store: YaraStore
}

const { store } = defineProps<Props>()
const { config } = storeToRefs(store)

const noneOption = { title: 'None', value: -1 }

const options = ref<Option[]>([noneOption])

const onSelect = (option: number) => {
	store.setView(option === -1 ? null : option)
}

const update = () => {
	if (!config.value) return
	options.value = [noneOption, ...viewConfigToOptions(config.value.views)]
}

watch([config], update)
onMounted(update)
</script>
