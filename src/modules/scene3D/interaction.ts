import * as THREE from 'three'
import type { Yara3DElements, Yara3DState } from './yara-3d'
import type { Effects } from './effects'

export type OnSelectCallback = (object3d: THREE.Object3D | null) => void

export type InteractionCallbacks = {
	onSelectCallback?: OnSelectCallback
}

export const addInteraction = (
	rootElement: HTMLElement,
	{ onSelectCallback }: InteractionCallbacks,
	{ scene, camera }: Yara3DElements,
	{ selectedPass, hoverPass }: Effects,
	state: Yara3DState
) => {
	const raycaster = new THREE.Raycaster()

	let isDragging = false
	let isToggling = false
	let timout: number | null = null
	let selectedObject: THREE.Object3D | null = null
	let toSelectObject: THREE.Object3D | null = null

	const getIntersection = (event: MouseEvent) => {
		const x = (event.clientX / rootElement.clientWidth) * 2 - 1
		const y = -(event.clientY / rootElement.clientHeight) * 2 + 1
		const mouse = new THREE.Vector2(x, y)

		raycaster.setFromCamera(mouse, camera)
		const intersectList = raycaster
			.intersectObject(scene, true)
			.map((intersection) => intersection.object)
			.filter((intersection) => intersection.visible)

		if (intersectList.length === 0) {
			return null
		}

		let selectedIntersection: THREE.Object3D | null = null

		if (isToggling && intersectList.at(-1) === selectedObject) return intersectList[0]
		for (const intersect of intersectList) {
			if (isToggling && selectedObject === intersect) {
				selectedIntersection = null
				continue
			}

			if (!selectedIntersection) {
				selectedIntersection = intersect
				continue
			}
		}

		return selectedIntersection
	}

	const onClick = (event: MouseEvent) => {
		setTimeout(() => {
			isDragging = false
		}, 100)
		if (isDragging) return
		if (timout) clearTimeout(timout)

		selectedObject = toSelectObject
		state.selectedObject = selectedObject

		selectedPass.selectedObjects = selectedObject ? [selectedObject] : []
		isToggling = true

		onHover(event, true)

		onSelectCallback?.call({}, selectedObject)
	}

	const onHover = (event: MouseEvent, toggle = false) => {
		if (isDragging) return
		isToggling = toggle

		const hoverObject = getIntersection(event)

		toSelectObject = hoverObject
		if (!hoverObject || hoverObject === selectedObject) {
			hoverPass.selectedObjects = []
			return
		}

		hoverPass.selectedObjects = [hoverObject]
	}

	const onMouseDown = () => {
		isDragging = false
		timout = setTimeout(() => {
			hoverPass.selectedObjects = []
			isDragging = true
		}, 200)
	}

	rootElement.addEventListener('mousedown', onMouseDown)
	rootElement.addEventListener('mousemove', onHover)
	rootElement.addEventListener('mouseup', onClick)

	const refresh = (model: THREE.Group) => {
		if (!selectedObject) return

		const object3d = model.getObjectByName(selectedObject.name)

		selectedObject = object3d ?? null

		if (!selectedObject) return
		selectedPass.selectedObjects = [selectedObject]
	}

	const dispose = () => {
		rootElement.removeEventListener('mousedown', onMouseDown)
		rootElement.removeEventListener('mousemove', onHover)
		rootElement.removeEventListener('mouseup', onClick)
	}

	return { refresh, dispose }
}

export type SceneInteraction = ReturnType<typeof addInteraction>
