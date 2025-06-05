import * as THREE from 'three'

export type LightsProps = {
	lightColor: THREE.ColorRepresentation
}

export const createLights = ({ lightColor }: LightsProps) => {
	const ambientLight = new THREE.AmbientLight(0xdddddd, Math.PI / 2)
	const spotLight = new THREE.SpotLight(undefined, Math.PI / 2, undefined, 0.15, 1, 0)
	const pointLight = new THREE.PointLight(undefined, Math.PI / 2, undefined, 0)

	spotLight.position.set(10, 10, 10)
	pointLight.position.set(-10, -10, -10)

	return [ambientLight, spotLight, pointLight]
}
