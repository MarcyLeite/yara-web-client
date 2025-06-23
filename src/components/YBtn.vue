<template>
	<div v-if="icon">
		<button
			:class="[
				className,
				!bgColor || bgColor === 'transparent' ? '' : `bg-${bgColor}`,
				elevation ? `elevation-${elevation}` : '',
				'text-light p-relative pa-2 rounded-pill hover shake',
			]"
			@click="(e) => emit('click', e)"
		>
			<y-icon :path="icon" />
		</button>
	</div>
</template>

<script setup lang="ts">
type Props = {
	class?: string
	icon?: string
	bgColor?: string
	elevation?: number
}

type Emit = {
	click: [payload: MouseEvent]
}

const { icon, bgColor, elevation, class: className } = defineProps<Props>()

const emit = defineEmits<Emit>()
</script>
