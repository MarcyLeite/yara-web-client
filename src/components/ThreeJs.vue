<template>
	<div class="w-100 h-100" ref="threejs-root"></div>
</template>

<script lang="ts" setup>
import { createYara3D, type Yara3D } from '@/modules/scene3D/yara-3d'
import type { YaraStore } from '@/stores/yara-store'
import type { Object3D } from 'three'

const threeJSRoot = useTemplateRef<HTMLDivElement>('threejs-root')
const yara3DRef = ref<Yara3D | null>()

type Props = {
	store: YaraStore
}

const { store } = defineProps<Props>()

const onSelectCallback = (object3d: Object3D | null) => {
	store.setSelectedObject3D(object3d)
}

onMounted(async () => {
	const rootElement = threeJSRoot.value
	if (!rootElement) return

	const yara3D = await createYara3D(threeJSRoot.value, 'snowman.glb', {
		onSelectCallback,
	})
	rootElement.appendChild(yara3D.renderer.domElement)

	yara3DRef.value = yara3D
	store.setYara3D(yara3D)
})

onUnmounted(() => {
	yara3DRef.value?.dispose()
})
</script>
