import type { Yara3DElements } from './yara-3d'

export const createResizeObserver = (
	rootElement: HTMLElement,
	animate: () => void,
	{ renderer, camera }: Yara3DElements
) => {
	const resizeObserver = new ResizeObserver(() => {
		const width = rootElement.clientWidth
		const height = rootElement.clientHeight

		renderer.setSize(width, height)
		camera.aspect = width / height
		camera.updateProjectionMatrix()

		animate()
	})

	resizeObserver.observe(rootElement)
	return resizeObserver
}
