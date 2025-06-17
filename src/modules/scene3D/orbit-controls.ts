import { Vector3, type Camera } from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

export type OrbitControlsProps = {
	element: HTMLElement
}

export const createOrbitControls = (camera: Camera, { element }: OrbitControlsProps) => {
	const orbitControls = new OrbitControls(camera, element)
	orbitControls.enableDamping = true
	orbitControls.target = new Vector3(0, 0, 0)
	orbitControls.minTargetRadius = 0
	orbitControls.maxTargetRadius = 100

	return orbitControls
}
