import * as THREE from 'three'

import { EffectComposer, RenderPass, OutlinePass } from 'three/examples/jsm/Addons.js'

export type EffectsProps = {
	renderer: THREE.WebGLRenderer
	scene: THREE.Scene
	camera: THREE.Camera
	boxSize: THREE.Vector2
}

export type Effects = {
	selectedPass: OutlinePass
	hoverPass: OutlinePass
}

const createOutlinePass = (
	{ boxSize, camera, scene }: EffectsProps,
	color: THREE.ColorRepresentation
) => {
	const outlinePass = new OutlinePass(boxSize, scene, camera)
	outlinePass.overlayMaterial.blending = 5
	outlinePass.clear = false

	outlinePass.edgeStrength = 2
	outlinePass.edgeGlow = 1

	outlinePass.visibleEdgeColor = new THREE.Color(color)
	outlinePass.hiddenEdgeColor = new THREE.Color(color)

	return outlinePass
}

export const createEffects = (props: EffectsProps) => {
	const { renderer, boxSize, scene, camera } = props
	const composer = new EffectComposer(renderer)
	composer.setSize(boxSize.width, boxSize.height)

	const renderPass = new RenderPass(scene, camera)
	renderPass.clear = false

	composer.addPass(renderPass)

	const selectedPass = createOutlinePass(props, 0xff00000)
	const hoverPass = createOutlinePass(props, 0xbbbbff)

	composer.addPass(selectedPass)
	composer.addPass(hoverPass)

	return { composer, effects: { selectedPass, hoverPass } }
}
