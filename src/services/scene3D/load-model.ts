import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

const createTransparentMaterial = (color: string | number) => {
	return new THREE.MeshStandardMaterial({
		color,
		transparent: true,
		roughness: 0.75,
		opacity: 0.4,
		depthWrite: false,
	})
}
export const ghostifyModel = (group: THREE.Group) => {
	for (const object3D of group.children) {
		updateOjbect3D(object3D as THREE.Mesh)
	}
}

const updateOjbect3D = (object3D: THREE.Mesh) => {
	object3D.material = createTransparentMaterial(0xffffff)
}
export const loadModel = (modelPath: string) => {
	const loader = new GLTFLoader()
	return new Promise<THREE.Group>((resolve) => {
		loader.load(modelPath, (gltf) => {
			resolve(gltf.scene)
		})
	})
}
