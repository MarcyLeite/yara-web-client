<template>
	<div ref="parentRef" class="p-relative text-button">
		<div @click="onClick()" :class="`${parentClass}${isFocused ? ' focused' : ' hover'}`">
			<div class="p-relative pointer-events-none">
				<label v-if="selectedTitle === null" class="p-absolute text-light-alpha-80">Select</label>
				<input class="text-light text-button" :style="{ width }" :value="selectedTitle" readonly />
			</div>
			<div :class="`focus-rotate${isFocused ? ' focused' : ''}`">
				<y-icon :path="mdiChevronDown" />
			</div>
		</div>
		<div v-if="isFocused" :class="optionsClass" style="margin-top: 2px">
			<div class="p-absoulte d-flex" v-for="(option, i) in options" :key="i">
				<button
					class="p-relative px-4 w-100 bg-panel-alpha-90 py-1 hover"
					@click="onSelect(option)"
				>
					{{ typeof option === 'string' ? option : option.title }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { mdiChevronDown } from '@mdi/js'

const parentClass = `w-100 z-100 rounded-lg
d-flex justify-space-between align-center ga-2
pl-4 pr-2 py-1
bg-panel-alpha-80 outline-light-alpha-50
clickable`

const optionsClass = `p-absolute w-100
d-flex flex-column border-light-alpha-50 elevation-1`

export type Option =
	| {
			title: string
			value: unknown
			[key: string]: any
	  }
	| string

type Props = {
	options: Option[]
	default?: unknown
	width?: string
}

type Emit = {
	select: [value: any]
}

const { options, width, default: defaultValue } = defineProps<Props>()
const emit = defineEmits<Emit>()

const parentRef = ref<HTMLDivElement | null>(null)
const isFocused = ref(false)
const selectedTitle = ref<unknown | null>(null)

const onClickGlobal = (e: MouseEvent) => {
	const target = e.target as HTMLElement
	if (!parentRef.value || !target) return
	if (parentRef.value && parentRef.value.contains(target)) {
		return
	}
	isFocused.value = false
}

const onSelect = (option: Option) => {
	if (typeof option === 'string') emit('select', option)
	else emit('select', option.value)
	isFocused.value = false
	selectedTitle.value = typeof option === 'string' ? option : option.title
}

const onClick = () => {
	isFocused.value = !isFocused.value
}

watch([isFocused], () => {
	if (!isFocused.value) {
		window.removeEventListener('click', onClickGlobal)
	} else {
		window.addEventListener('click', onClickGlobal)
	}
})

if (defaultValue !== undefined) {
	for (const i in options) {
		const option = options[i]
		if (
			(typeof option === 'string' && defaultValue === option) ||
			(typeof option === 'object' && defaultValue === option.value)
		) {
			onSelect(option)
			break
		}
	}
}

onUnmounted(() => {
	window.addEventListener('click', onClickGlobal)
})
</script>
