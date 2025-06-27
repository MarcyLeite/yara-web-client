import * as THREE from 'three'
import type { SceneInteraction } from './interaction'
import type { ComponentStateMap, View } from '../view'
import { ghostifyModel } from './load-model'
import type { Yara3DState } from './yara-3d'

export const createTransmutator = (
	scene: THREE.Scene,
	originalModel: THREE.Group,
	interaction: SceneInteraction,
	state: Yara3DState
) => {
	let model: THREE.Group
	const resetModel = () => {
		for (const name of hiddenList) {
			toggleObjectVisible(name, true)
		}
		scene.remove(model)
		model = originalModel.clone(true)

		scene.add(model)
		interaction.refresh(model)
	}

	const reset = (view?: View | null) => {
		resetModel()
		if (!view) return

		const { mode } = view.scene
		if (mode === 'ghost') ghostifyModel(model)

		for (const name of view.components.hidden) {
			toggleObjectVisible(name, false)
		}
	}

	const paint = (componentColorMap: ComponentStateMap) => {
		for (const [name, colorObject] of Object.entries(componentColorMap)) {
			const color = colorObject.color
			const object3d = scene.getObjectByName(name) as THREE.Mesh

			if (!object3d || !color) continue
			const material = (object3d.material as THREE.MeshStandardMaterial).clone()

			material.color = new THREE.Color(color)
			object3d.material = material
		}
	}

	const hiddenList: string[] = []
	const toggleObjectVisible = (name: string, value: boolean) => {
		const object3d = model.getObjectByName(name)

		if (!object3d) return
		object3d.visible = value

		const index = hiddenList.indexOf(name)
		if (!value && index === -1) hiddenList.push(name)
		else if (value && index > -1) {
			hiddenList.splice(index, 1)
		}
		state.hiddenList = [...hiddenList]
	}

	reset()

	return {
		resetModel,
		reset,
		paint,
		toggleObjectVisible,
	}
}
