import * as THREE from 'three'
import type { Yara3DElements } from './yara-3d'

export type RendererProps = {
	boxSize: THREE.Vector2
}

export const createRenderer = ({ boxSize }: RendererProps) => {
	const renderer = new THREE.WebGLRenderer()
	renderer.setSize(boxSize.x, boxSize.y)
	return renderer
}

export const startAnimationLoop = ({
	renderer,
	scene,
	camera,
	orbitControls,
	composer,
}: Yara3DElements) => {
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
	}

	renderer.setAnimationLoop(animate)

	return {
		animate,
		get fps() {
			return fps
		},
	}
}
