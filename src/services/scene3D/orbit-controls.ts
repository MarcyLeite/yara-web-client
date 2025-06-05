import type { Camera } from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

export type OrbitControlsProps = {
	element: HTMLElement
}

export const createOrbitControls = (camera: Camera, { element }: OrbitControlsProps) => {
	const orbitControls = new OrbitControls(camera, element)
	orbitControls.enableDamping = true

	return orbitControls
}
