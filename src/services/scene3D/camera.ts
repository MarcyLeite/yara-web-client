import * as THREE from 'three'

export type CameraProps = {
	boxSize: THREE.Vector2
}

export const createCamera = ({ boxSize }: CameraProps) => {
	const camera = new THREE.PerspectiveCamera(75, boxSize.x / boxSize.y, 0.1, 100)
	camera.position.z = 5

	return camera
}
