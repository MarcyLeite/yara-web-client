import * as THREE from 'three'
import { createLights, type LightsProps } from './lights'
import { createCamera, type CameraProps } from './camera'

type SceneProps = {
	backgroundColor: THREE.ColorRepresentation
} & LightsProps &
	CameraProps

export const createScene = (props: SceneProps) => {
	const { backgroundColor } = props
	const scene = new THREE.Scene()

	scene.background = new THREE.Color(backgroundColor)

	const lightList = createLights(props)
	scene.add(...lightList)

	const camera = createCamera(props)
	scene.add(camera)

	return { scene, camera }
}
