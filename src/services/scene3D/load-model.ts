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

export const loadModel = (modelPath: string) => {
	const loader = new GLTFLoader()
	const updateOjbect3D = (object3D: THREE.Mesh) => {
		object3D.material = createTransparentMaterial(0xffffff)
	}
	return new Promise<THREE.Group>((resolve) => {
		loader.load(modelPath, (gltf) => {
			for (const object3D of gltf.scene.children) {
				updateOjbect3D(object3D as THREE.Mesh)
			}
			resolve(gltf.scene)
		})
	})
}
