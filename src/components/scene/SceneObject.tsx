import { YaraView } from '../../modules/views/factory'
import { GLTF } from 'three/examples/jsm/Addons.js'
import { Group, Mesh, MeshStandardMaterial, Object3D, Object3DEventMap } from 'three'
import { MeshProps } from '@react-three/fiber'
import { Dispatch } from 'react'

export type SetSelected = Dispatch<Object3D | null>

type ComponentProps = {
	base: Object3D<Object3DEventMap>
	view: YaraView | null
	colorMap: Record<string, string>
	setSelected: SetSelected
}

const createTransparentMaterial = (color: string) => {
	return new MeshStandardMaterial({
		color,
		transparent: true,
		roughness: 0.75,
		opacity: 0.4,
		depthWrite: false,
	})
}

const Component = (props: ComponentProps) => {
	const { base, setSelected, view, colorMap } = props
	const groupBase = base as Group<Object3DEventMap>
	const meshBase = base as Mesh

	return groupBase.isGroup ? (
		<group dispose={null}>
			{groupBase.children.map((children, i) => {
				return (
					<Component
						setSelected={setSelected}
						view={view}
						colorMap={colorMap}
						base={children}
						key={i}
					/>
				)
			})}
		</group>
	) : (
		<mesh
			{...(meshBase as unknown as MeshProps)}
			material={createTransparentMaterial(colorMap[meshBase.name] ?? '#505050')}
			visible={view ? !view.hiddenComponentList.includes(meshBase.name) : true}
			onClick={(e) => {
				if (!e.eventObject.visible) return
				setSelected(e.eventObject)
				e.stopPropagation()
			}}
		/>
	)
}

type Props = {
	model: GLTF
	view: YaraView | null
	colorMap: Record<string, string>
	setSelected: SetSelected
}
const InteractableObject = ({ model, view, colorMap, setSelected }: Props) => {
	return <Component base={model.scene} view={view} colorMap={colorMap} setSelected={setSelected} />
}

export default InteractableObject
