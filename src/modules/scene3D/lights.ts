import * as THREE from 'three'

export type LightsProps = {
	lightColor: THREE.ColorRepresentation
}

export const createLights = (_props: LightsProps) => {
	const ambientLight = new THREE.AmbientLight(0xdddddd, Math.PI / 2)
	const spotLight = new THREE.SpotLight(undefined, 8, undefined, 0.15, 1, 0)
	const pointLight = new THREE.PointLight(undefined, 8, undefined, 0)

	spotLight.position.set(10, 10, 10)
	pointLight.position.set(-10, -10, -10)

	return [ambientLight, spotLight, pointLight]
}
