<template>
	<div v-if="icon">
		<button class="p-relative pa-2 rounded-pill hover shake" @click="(e) => emit('click', e)">
			<y-icon :path="icon" />
		</button>
	</div>
</template>

<script setup lang="ts">
type Props = {
	icon?: string
}

type Emit = {
	click: [payload: MouseEvent]
}

const { icon } = defineProps<Props>()

const emit = defineEmits<Emit>()
</script>
