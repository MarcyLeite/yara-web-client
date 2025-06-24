<template>
	<div>
		<button v-if="btnType === 'flat'" :class="[...defaultClass, 'hover-text']" @click="click">
			<y-icon v-if="icon" :path="icon" />
			<slot></slot>
		</button>
		<button
			v-else
			:class="[...defaultClass, 'text-light p-relative pa-2 rounded-pill hover shake']"
			@click="click"
		>
			<y-icon v-if="icon" :path="icon" />
			<slot></slot>
		</button>
	</div>
</template>

<script setup lang="ts">
type Props = {
	class?: string
	icon?: string
	bgColor?: string
	elevation?: number
	type?: 'default' | 'flat'
}

type Emit = {
	click: [payload: MouseEvent]
}

const { icon, bgColor, elevation, class: className, type: btnType } = defineProps<Props>()

const defaultClass = [
	className,
	!bgColor || bgColor === 'transparent' ? '' : `bg-${bgColor}`,
	elevation ? `elevation-${elevation}` : '',
]

const emit = defineEmits<Emit>()

const click = (e: MouseEvent) => emit('click', e)
</script>
