import * as THREE from 'three'
import { createRenderer } from './renderer'
import { createLights, type LightsProps } from './lights'
import { createCamera, type CameraProps } from './camera'
import { createEffects, type EffectsProps } from './effects'
import { createOrbitControls, type OrbitControlsProps } from './orbit-controls'

type SceneProps = {
	backgroundColor: THREE.ColorRepresentation
} & LightsProps &
	CameraProps

export const createScene = (model: THREE.Group, props: SceneProps) => {
	const { backgroundColor } = props
	const scene = new THREE.Scene()

	scene.background = new THREE.Color(backgroundColor)
	scene.add(model)

	const lightList = createLights(props)
	scene.add(...lightList)

	const camera = createCamera(props)
	scene.add(camera)

	return { scene, camera }
}
