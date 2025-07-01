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
	visibleColor: THREE.ColorRepresentation,
	hiddenColor = visibleColor,
	strength = 2,
	glow = 1
) => {
	const outlinePass = new OutlinePass(boxSize, scene, camera)
	outlinePass.overlayMaterial.blending = 5
	outlinePass.clear = false

	outlinePass.edgeStrength = strength
	outlinePass.edgeThickness = strength
	outlinePass.edgeGlow = glow

	outlinePass.visibleEdgeColor = new THREE.Color(visibleColor)
	outlinePass.hiddenEdgeColor = new THREE.Color(hiddenColor)

	return outlinePass
}

export const createEffects = (props: EffectsProps) => {
	const { renderer, boxSize, scene, camera } = props
	const composer = new EffectComposer(renderer)
	composer.setSize(boxSize.width, boxSize.height)

	const renderPass = new RenderPass(scene, camera)
	renderPass.clear = false

	composer.addPass(renderPass)

	const hoverPass = createOutlinePass(props, 0x0000ff, 0x000099, 1, 1)
	const selectedPass = createOutlinePass(props, 0xffaaaa, 0x990000, 2, 2)

	composer.addPass(hoverPass)
	composer.addPass(selectedPass)

	return { composer, effects: { selectedPass, hoverPass } }
}
