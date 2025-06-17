import * as THREE from 'three'
import { createScene } from './scene'
import { createOrbitControls } from './orbit-controls'
import { createRenderer, startAnimationLoop } from './renderer'
import { createEffects } from './effects'
import { ghostifyModel, loadModel } from './load-model'
import type { EffectComposer, OrbitControls } from 'three/examples/jsm/Addons.js'
import { createResizeObserver } from './resize-observer'
import { addInteraction, type InteractionCallbacks } from './interactions'
import type { ComponentColorMap, View } from '../view'

export type Yara3DOptions = {
	mode: 'ghost'
}

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

	const originalModel = await loadModel(modelPath)
	let model: THREE.Group

	const { scene, camera } = createScene({
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

	const resetCamera = () => {
		orbitControls.target = new THREE.Vector3(0, 0, 0)
	}

	const reset = (view?: View) => {
		scene.remove(model)
		model = originalModel.clone(true)

		if (!view) {
			scene.add(model)
			interaction.refresh(model)
			return
		}

		const { mode } = view.scene
		const { hidden: hiddenList } = view.components

		if (mode === 'ghost') ghostifyModel(model)

		for (const hidden of hiddenList) {
			const object3d = model.getObjectByName(hidden)
			if (!object3d) continue
			object3d.visible = false
		}

		scene.add(model)
		interaction.refresh(model)
	}

	reset()

	const paint = (componentColorMap?: ComponentColorMap) => {
		if (!componentColorMap) return
		for (const [name, color] of Object.entries(componentColorMap)) {
			const object3d = scene.getObjectByName(name) as THREE.Mesh
			if (!object3d || !color) continue
			const material = (object3d.material as THREE.MeshStandardMaterial).clone()

			material.color = new THREE.Color(color)
			object3d.material = material
		}
	}

	const dispose = () => {
		renderer.dispose()
		orbitControls.dispose()
		interaction.dispose()
		composer.dispose()
		resizeObserver.disconnect()
	}

	return { fps, renderer, resizeObserver, resetCamera, paint, reset, dispose }
}

export type Yara3D = Awaited<ReturnType<typeof createYara3D>>
