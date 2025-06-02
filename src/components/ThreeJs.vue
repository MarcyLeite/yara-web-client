<template>
	<div class="w-100 h-100" ref="threejs-root"></div>
</template>

<script lang="ts" setup>
import { createYara3D } from '@/services/yara-3d'
import * as THREE from 'three'

const threeJSRoot = useTemplateRef<HTMLDivElement>('threejs-root')

const cameraRef = ref<THREE.PerspectiveCamera | null>()
const sceneRef = ref<THREE.Scene | null>()
const rendererRef = ref<THREE.WebGLRenderer | null>()

const resizeObserverRef = ref<ResizeObserver | null>()

onMounted(() => {
	const rootElement = threeJSRoot.value
	if (!rootElement) return

	const { renderer, scene, camera, resizeObserver } = createYara3D(threeJSRoot.value)
	resizeObserver.observe(rootElement)
	resizeObserverRef.value = resizeObserver

	rootElement.appendChild(renderer.domElement)

	rendererRef.value = renderer
	cameraRef.value = camera
	sceneRef.value = scene
})

onUnmounted(() => {
	const renderer = rendererRef.value
	const resizeObserver = resizeObserverRef.value
	renderer?.dispose()
	resizeObserver?.disconnect()
})
</script>
