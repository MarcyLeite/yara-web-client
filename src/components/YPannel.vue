<template>
	<div
		:class="[
			'bg-panel-alpha-80 ba-1 outline-panel-border-alpha-90 text-light pa-2 elevation-1',
			`rounded-${rounded ?? 'xl'}`,
		]"
	>
		<slot></slot>
	</div>
</template>

<script setup lang="ts">
type Props = {
	rounded?: string
}

const { rounded } = defineProps<Props>()
</script>
