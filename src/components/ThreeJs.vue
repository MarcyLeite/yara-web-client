<template>
	<div class="w-100 h-100" ref="threejs-root"></div>
</template>

<script lang="ts" setup>
import { createYara3D, type Yara3D } from '@/modules/scene3D/yara-3d'
import type { YaraStore } from '@/stores/yara-store'
import { storeToRefs } from 'pinia'
import type { Object3D } from 'three'

const threeJSRoot = useTemplateRef<HTMLDivElement>('threejs-root')
const yara3DRef = ref<Yara3D | null>()

type Props = {
	store: YaraStore
}

const { store } = defineProps<Props>()
const { modelPath } = storeToRefs(store)

const onSelectCallback = (object3d: Object3D | null) => {
	store.setSelectedObject3D(object3d)
}

const loadComponent = async () => {
	yara3DRef.value?.dispose()
	const rootElement = threeJSRoot.value
	if (!rootElement || !modelPath.value) return

	const yara3D = await createYara3D(
		threeJSRoot.value,
		`${import.meta.env.API_PATH}${modelPath.value}`,
		{
			onSelectCallback,
		}
	)

	rootElement.appendChild(yara3D.renderer.domElement)

	yara3DRef.value = yara3D
	store.setYara3D(yara3D)
}

onMounted(loadComponent)

watch([modelPath], loadComponent)
onUnmounted(() => {
	yara3DRef.value?.dispose()
})
</script>
