import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

const createTransparentMaterial = (color: string | number) => {
	return new THREE.MeshStandardMaterial({
		color,
		transparent: true,
		roughness: 0.75,
		opacity: 0.4,
		depthWrite: false,
		depthTest: false,
	})
}
export const ghostifyObject = (object: THREE.Group | THREE.Mesh) => {
	let i = 0
	const object3d = object as THREE.Mesh
	if(object3d.isMesh) {
		
			updateOjbect3D(object3d, i)
			return
	}

	const group = object as THREE.Group

	for (const object3D of group.children) {
		updateOjbect3D(object3D as THREE.Mesh, i)
		i++
	}

}

const updateOjbect3D = (object3D: THREE.Mesh, i: number) => {
	object3D.material = createTransparentMaterial(0xffffff)
	object3D.renderOrder = i
}

export const doRecursily = (object3D: THREE.Object3D, callback: (mesh: THREE.Mesh) => void) => {
	const groupObject3D = object3D as THREE.Group
	if (groupObject3D.isGroup) {
		for (const child of groupObject3D.children) {
			doRecursily(child, callback)
		}
		return
	}

	const meshObject3D = object3D as THREE.Mesh

	callback(meshObject3D)
}

export const loadModel = (modelPath: string) => {
	const loader = new GLTFLoader()
	return new Promise<THREE.Group>((resolve) => {
		loader.load(modelPath, (gltf) => {
			resolve(gltf.scene)
		})
	})
}
