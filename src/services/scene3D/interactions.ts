import * as THREE from 'three'
import type { Yara3DElements } from './yara-3d'
import type { Effects } from './effects'

export const addInteraction = (
	rootElement: HTMLElement,
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
		const intersect = raycaster.intersectObject(scene, true)[0]
		return intersect
	}

	const onClick = (event: MouseEvent) => {
		setTimeout(() => {
			isDragging = false
		}, 100)
		if (isDragging) return
		if (timout) clearTimeout(timout)

		const intersect = getIntesection(event)
		if (!intersect) {
			selectedObject = null
			selectedPass.selectedObjects = []
			return
		}

		selectedObject = intersect.object

		selectedPass.selectedObjects = [selectedObject]
		hoverPass.selectedObjects = []
	}

	const onHover = (event: MouseEvent) => {
		if (isDragging) return

		const intersect = getIntesection(event)
		if (!intersect) {
			hoverPass.selectedObjects = []
			return
		}
		if (intersect.object === selectedPass.selectedObjects[0]) return

		hoverPass.selectedObjects = [intersect.object]
	}

	const onMouseDown = () => {
		isDragging = false
		timout = setTimeout(() => {
			isDragging = true
		}, 100)
	}

	rootElement.addEventListener('mousedown', onMouseDown)
	rootElement.addEventListener('mousemove', onHover)
	rootElement.addEventListener('mouseup', onClick)

	const dispose = () => {
		rootElement.removeEventListener('mousedown', onMouseDown)
		rootElement.removeEventListener('mousemove', onHover)
		rootElement.removeEventListener('mouseup', onClick)
	}

	return { dispose }
}
