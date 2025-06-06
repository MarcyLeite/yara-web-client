<template>
	<div class="w-100 h-100" ref="threejs-root"></div>
</template>

<script lang="ts" setup>
import { createYara3D, type Yara3D } from '@/services/scene3D/yara-3d'
import type { YaraStore } from '@/stores/yara-store'
import { storeToRefs } from 'pinia'
import type { Object3D } from 'three'

const threeJSRoot = useTemplateRef<HTMLDivElement>('threejs-root')
const yara3DRef = ref<Yara3D | null>()

type Props = {
	store: YaraStore
}

const { store } = defineProps<Props>()
const { colorMap, view } = storeToRefs(store)

type Emits = {
	select: [object: Object3D | null]
}

const emit = defineEmits<Emits>()

const onSelectCallback = (object3d: Object3D | null) => {
	emit('select', object3d)
}

watch([colorMap], () => {
	if (!yara3DRef.value || !colorMap.value) return
	yara3DRef.value.paint(colorMap.value)
})

watch([view], () => {
	yara3DRef.value?.refresh(view.value?.scene.mode)
	store.refreshColorMap()
})

onMounted(async () => {
	const rootElement = threeJSRoot.value
	if (!rootElement) return

	const yara3D = await createYara3D(threeJSRoot.value, 'snowman.glb', {
		onSelectCallback,
	})
	rootElement.appendChild(yara3D.renderer.domElement)

	yara3DRef.value = yara3D
})

onUnmounted(() => {
	yara3DRef.value?.dispose()
})
</script>
