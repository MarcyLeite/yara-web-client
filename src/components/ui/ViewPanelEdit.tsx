import { useState } from 'react'
import ITextarea from '../common/ITextarea'
import { PropsWithIndamoStore } from '../../store'
import IButton from '../common/IButton'
const ViewPanelEdit = ({ configuration, viewIndex, view }: PropsWithIndamoStore) => {
	const [display, setDisplay] = useState(view?.display ?? '')
	const [type, setType] = useState(view?.type ?? 'thermal')
	const [min, setMin] = useState(view?.colorMapConfig.min ?? 0)
	const [max, setMax] = useState(view?.colorMapConfig.max ?? 1)

	return (
		<div className="d-flex flex-column ga-2">
			<div className="d-flex flex-column w-fit-content ga-2">
				<div className="d-flex justify-space-between ga-2">
					<span className="text-bold">Display:</span>
					<ITextarea cols={14} value={display} onChange={(e) => setDisplay(e.target.value)} />
				</div>
				<div className="d-flex justify-space-between ga-2">
					<span className="text-bold">Type:</span>
					<ITextarea
						cols={14}
						value={type}
						onChange={(e) => setType(e.target.value as 'thermal')}
					/>
				</div>
			</div>
			<div className="d-flex flex-column w-fit-content ga-2">
				<div className="d-flex justify-space-between ga-8">
					<span className="text-bold">Min:</span>
					<ITextarea
						cols={6}
						value={min.toString()}
						onChange={(e) => setMin(Number(e.target.value))}
					/>
				</div>
				<div className="d-flex justify-space-between ga-8">
					<span className="text-bold">Max:</span>
					<ITextarea
						cols={6}
						value={max.toString()}
						onChange={(e) => setMax(Number(e.target.value))}
					/>
				</div>
			</div>
			<div className="d-flex justify-end">
				<IButton
					className="rounded-lg px-4"
					onClick={() =>
						configuration.updateViewConfig(viewIndex!, {
							display,
							colorMap: {
								type: 'thermal',
								min,
								max,
							},
						})
					}
				>
					Save
				</IButton>
			</div>
		</div>
	)
}

export default ViewPanelEdit
