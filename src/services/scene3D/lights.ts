import * as THREE from 'three'

export type LightsProps = {
	lightColor: THREE.ColorRepresentation
}

export const createLights = ({ lightColor }: LightsProps) => {
	const light = new THREE.DirectionalLight(lightColor, 2)
	light.position.set(10, 10, 10)

	return [light]
}
