import { mdiEye, mdiPencil } from '@mdi/js'
import IButton from '../IButton'
import ITab from '../ITab'
import { ViewController } from '../../modules/views/controller'
import { useEffect, useState } from 'react'
import IClock from './IClock'
import { IndamoModeType } from '../../modules/modes/controller'
import { useTimeControl } from '../../modules/time-control/hook'

type Props = {
	viewController: ViewController
	mode: IndamoModeType
	setMode: (mode: IndamoModeType) => void
}

const FixedHud = ({ viewController, mode, setMode }: Props) => {
	const [selectedViewIndex, setSelectedViewIndex] = useState(
		viewController.viewList.findIndex((v) => viewController.selectedView?.id === v.id)
	)

	useEffect(() => {
		if (selectedViewIndex === -1) {
			viewController.setView('')
			return
		}
		viewController.setView(viewController.viewList[selectedViewIndex].id)
	}, [viewController, selectedViewIndex])

	const timeControl = useTimeControl()

	return (
		<div>
			<IClock datetime={timeControl.moment} />
			<ITab
				elements={viewController.viewList.map((v) => v.display)}
				selected={selectedViewIndex}
				setSelected={setSelectedViewIndex}
			/>
			<IButton
				icon={mode === 'view' ? mdiEye : mdiPencil}
				onClick={() => {
					setMode(mode === 'view' ? 'editor' : 'view')
				}}
			/>
		</div>
	)
}

export default FixedHud
