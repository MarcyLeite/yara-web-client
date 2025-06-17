import * as THREE from 'three'
import type { Yara3DElements } from './yara-3d'
import type { Effects } from './effects'

export type OnSelectCallback = (object3d: THREE.Object3D | null) => void

export type InteractionCallbacks = {
	onSelectCallback?: OnSelectCallback
}

export const addInteraction = (
	rootElement: HTMLElement,
	{ onSelectCallback }: InteractionCallbacks,
	{ scene, camera }: Yara3DElements,
	{ selectedPass, hoverPass }: Effects
) => {
	const raycaster = new THREE.Raycaster()

	let isDragging = false
	let timout: number | null = null
	let selectedObject: THREE.Object3D | null = null

	const getIntesection = (event: MouseEvent) => {
		const x = (event.clientX / rootElement.clientWidth) * 2 - 1
		const y = -(event.clientY / rootElement.clientHeight) * 2 + 1
		const mouse = new THREE.Vector2(x, y)

		raycaster.setFromCamera(mouse, camera)
		const intersectList = raycaster.intersectObject(scene, true)
		for (const intersect of intersectList) {
			if (intersect.object && intersect.object.visible) return intersect.object
		}

		return null
	}

	const onClick = (event: MouseEvent) => {
		setTimeout(() => {
			isDragging = false
		}, 100)
		if (isDragging) return
		if (timout) clearTimeout(timout)

		const selectedObject = getIntesection(event)

		selectedPass.selectedObjects = selectedObject ? [selectedObject] : []
		hoverPass.selectedObjects = []

		onSelectCallback?.call({}, selectedObject)
	}

	const onHover = (event: MouseEvent) => {
		if (isDragging) return

		const selectedObject = getIntesection(event)
		if (!selectedObject) {
			hoverPass.selectedObjects = []
			return
		}

		hoverPass.selectedObjects = [selectedObject]
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
