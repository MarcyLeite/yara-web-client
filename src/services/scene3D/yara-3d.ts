import * as THREE from 'three'
import { createScene } from './scene'
import { createOrbitControls } from './orbit-controls'
import { createRenderer, startAnimationLoop } from './renderer'
import { createEffects } from './effects'
import { loadModel } from './load-model'
import type { EffectComposer, OrbitControls } from 'three/examples/jsm/Addons.js'
import { createResizeObserver } from './resize-observer'
import { addInteraction, type InteractionCallbacks } from './interactions'

const extractSize = (rootElement: HTMLElement) => {
	const width = rootElement.clientWidth
	const height = rootElement.clientHeight

	return new THREE.Vector2(width, height)
}

export type Yara3DElements = {
	renderer: THREE.WebGLRenderer
	scene: THREE.Scene
	camera: THREE.PerspectiveCamera
	orbitControls: OrbitControls
	composer: EffectComposer
}

export const createYara3D = async (
	rootElement: HTMLElement,
	modelPath: string,
	interactionsCallback: InteractionCallbacks
) => {
	const boxSize = extractSize(rootElement)
	const model = await loadModel(modelPath)

	const { scene, camera } = createScene(model, {
		boxSize,
		backgroundColor: 0xffffff,
		lightColor: 0xdddddd,
	})

	const renderer = createRenderer({ boxSize })
	const orbitControls = createOrbitControls(camera, { element: rootElement })
	const { composer, effects } = createEffects({ renderer, scene, camera, boxSize })

	const sceneElements = { renderer, scene, camera, orbitControls, composer }

	const { animate, fps } = startAnimationLoop(sceneElements)
	const resizeObserver = createResizeObserver(rootElement, animate, sceneElements)
	const interaction = addInteraction(rootElement, interactionsCallback, sceneElements, effects)

	const dispose = () => {
		renderer.dispose()
		orbitControls.dispose()
		interaction.dispose()
		composer.dispose()
		resizeObserver.disconnect()
	}

	return { renderer, fps, resizeObserver, dispose }
}

export type Yara3D = Awaited<ReturnType<typeof createYara3D>>
