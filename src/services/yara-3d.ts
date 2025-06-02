import * as THREE from 'three'

const extractSize = (rootElement: HTMLElement) => {
	const width = rootElement.clientWidth
	const height = rootElement.clientHeight

	return { width, height }
}

const createResizeObserver = (
	rootElement: HTMLElement,
	renderer: THREE.WebGLRenderer,
	camera: THREE.PerspectiveCamera,
	scene: THREE.Scene
) => {
	return new ResizeObserver(() => {
		const { width, height } = extractSize(rootElement)
		renderer.setSize(width, height)
		camera.aspect = width / height
		camera.updateProjectionMatrix()

		renderer.render(scene, camera)
	})
}

export const createYara3D = (rootElement: HTMLDivElement) => {
	const { width, height } = extractSize(rootElement)

	const scene = new THREE.Scene()
	const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

	const renderer = new THREE.WebGLRenderer()

	camera.position.z = 5

	const animate = () => {
		renderer.render(scene, camera)
	}

	renderer.setAnimationLoop(animate)
	renderer.setSize(width, height)

	const resizeObserver = createResizeObserver(rootElement, renderer, camera, scene)

	return { scene, renderer, camera, resizeObserver }
}
