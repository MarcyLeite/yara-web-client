<template>
	<div class="w-100 h-100" ref="threejs-root"></div>
</template>

<script lang="ts" setup>
import { createYara3D, type Yara3D } from '@/services/scene3D/yara-3d'

const threeJSRoot = useTemplateRef<HTMLDivElement>('threejs-root')

const yara3DRef = ref<Yara3D | null>()

onMounted(async () => {
	const rootElement = threeJSRoot.value
	if (!rootElement) return

	const yara3D = await createYara3D(threeJSRoot.value, 'snowman.glb')
	rootElement.appendChild(yara3D.renderer.domElement)

	yara3DRef.value = yara3D
})

onUnmounted(() => {
	console.log(yara3DRef.value)
	yara3DRef.value?.dispose()
})
</script>
