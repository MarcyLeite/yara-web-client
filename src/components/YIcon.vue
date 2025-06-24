<template>
	<div class="d-flex icon">
		<svg
			viewBox="0 0 24 24"
			:style="{ height: `${size ?? '1.5em'}`, verticalAlign: 'middle' }"
			role="presentation"
		>
			<path :d="path" fill="currentColor"></path>
		</svg>
	</div>
</template>

<script setup lang="ts">
type Props = {
	path: string
	size?: string
}

const { path, size } = defineProps<Props>()
</script>
