import * as THREE from 'three'
import { createScene } from './scene'
import { createOrbitControls } from './orbit-controls'
import { createRenderer, startAnimationLoop } from './renderer'
import { createEffects } from './effects'
import { loadModel } from './load-model'
import type { EffectComposer, OrbitControls } from 'three/examples/jsm/Addons.js'
import { createResizeObserver } from './resize-observer'
import { addInteraction, type InteractionCallbacks } from './interaction'
import { createTransmutator } from './transmutator'

export type Yara3DMaterial = 'ghost' | 'default'
export type Yara3DOptions = {
	material: Yara3DMaterial
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

export type Yara3DState = {
	fps: number
	hiddenList: string[]
	selectedObject: THREE.Object3D | null
}

type StateKeys = keyof Yara3DState

export const createYara3D = async (
	rootElement: HTMLElement,
	modelPath: string,
	interactionsCallback: InteractionCallbacks
) => {
	const boxSize = extractSize(rootElement)
	const originalModel = await loadModel(modelPath)

	const state = {
		fps: 0,
		hiddenList: [],
		selectedObject: null,
	}

	const handler: ProxyHandler<Yara3DState> = {
		set(target, prop: StateKeys, value) {
			target[prop] = value
			yara3D.onStateChange(prop, value)
			return true
		},
	}

	const proxyState = new Proxy(state, handler)

	const { scene, camera } = createScene({
		boxSize,
		backgroundColor: 0x000000,
		lightColor: 0xdddddd,
	})

	const renderer = createRenderer({ boxSize })

	const orbitControls = createOrbitControls(camera, { element: rootElement })
	const { composer, effects } = createEffects({ renderer, scene, camera, boxSize })

	const sceneElements = { renderer, scene, camera, orbitControls, composer }

	const { animate } = startAnimationLoop(sceneElements, proxyState)
	const resizeObserver = createResizeObserver(rootElement, animate, sceneElements)
	const interaction = addInteraction(
		rootElement,
		interactionsCallback,
		sceneElements,
		effects,
		proxyState
	)
	const transmutator = createTransmutator(scene, originalModel, interaction, proxyState)

	const resetCamera = () => {
		orbitControls.target = new THREE.Vector3(0, 0, 0)
	}

	const dispose = () => {
		transmutator.reset()
		renderer.dispose()
		orbitControls.dispose()
		interaction.dispose()
		composer.dispose()
		resizeObserver.disconnect()
	}

	const yara3D = Object.assign(
		{
			renderer,
			resetCamera,
			dispose,
			onStateChange: (_prop: StateKeys, _value: unknown) => {},
		},
		transmutator
	)

	return yara3D
}

export type Yara3D = Awaited<ReturnType<typeof createYara3D>>
