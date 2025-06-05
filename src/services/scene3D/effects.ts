import * as THREE from 'three'

import { EffectComposer, RenderPass, OutlinePass } from 'three/examples/jsm/Addons.js'

export type EffectsProps = {
	boxSize: THREE.Vector2
}

export const createEffects = (
	renderer: THREE.WebGLRenderer,
	scene: THREE.Scene,
	camera: THREE.Camera,
	{ boxSize }: EffectsProps
) => {
	const composer = new EffectComposer(renderer)
	composer.setSize(boxSize.width, boxSize.height)

	const renderPass = new RenderPass(scene, camera)
	renderPass.clear = false

	composer.addPass(renderPass)

	const outlinePass = new OutlinePass(boxSize, scene, camera, [scene.children[0].children[0]])
	outlinePass.overlayMaterial.blending = 5
	outlinePass.clear = false

	outlinePass.edgeStrength = 2
	outlinePass.edgeGlow = 2
	outlinePass.visibleEdgeColor = new THREE.Color(0xffaaaa)
	outlinePass.hiddenEdgeColor = new THREE.Color(0xffaaaa)

	composer.addPass(outlinePass)

	return composer
}
