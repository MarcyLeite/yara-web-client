import * as THREE from 'three'
import type { Yara3DElements, Yara3DState } from './yara-3d'

export type RendererProps = {
	boxSize: THREE.Vector2
}

export const createRenderer = ({ boxSize }: RendererProps) => {
	const renderer = new THREE.WebGLRenderer()
	renderer.setSize(boxSize.x, boxSize.y)
	return renderer
}

export const startAnimationLoop = (
	{ renderer, scene, camera, orbitControls, composer }: Yara3DElements,
	state: Yara3DState
) => {
	let fps = 0
	let prev = 0
	const animate = (deltaSection?: number) => {
		if (deltaSection) {
			const delta = deltaSection - prev
			fps = 1000 / delta
			prev = deltaSection
		}

		orbitControls.update()
		renderer.render(scene, camera)
		composer.render()

		state.fps = fps
	}

	renderer.setAnimationLoop(animate)

	return {
		animate,
		getFps: () => fps,
	}
}
