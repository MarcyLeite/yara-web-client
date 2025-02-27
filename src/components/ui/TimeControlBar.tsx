import {
	mdiCircle,
	mdiDebugStepOver,
	mdiFastForward10,
	mdiFastForward5,
	mdiPause,
	mdiPlay,
	mdiRewind10,
	mdiRewind5,
	mdiSpeedometerSlow,
} from '@mdi/js'
import IButton from '../common/IButton'
import { TimeControl } from '../../modules/time-control/hook'
import ISelection from '../common/ISelection'
import IHoverElement from '../common/IHoverElement'
import IPanel from '../common/IPanel'
import ICalendar from '../common/ICalendar'
import ISeparator from '../common/ISeparator'
import Icon from '../common/Icon'
import { useState } from 'react'

type Props = {
	timeControl: TimeControl
	moment: Date
}

const TimeControlBar = ({ timeControl, moment }: Props) => {
	const buttonClass = 'pa-2 rounded-circle'
	const [calendarDate, setCalendarDate] = useState(timeControl.moment.current)

	return (
		<div>
			<div className="d-flex ga-8 justify-center">
				<div className="d-flex">
					<IButton
						className={buttonClass}
						icon={mdiRewind10}
						onClick={() => timeControl.goToward(-10)}
					/>
					<IButton
						className={buttonClass}
						icon={mdiRewind5}
						onClick={() => timeControl.goToward(-5)}
					/>
					<IButton
						className={buttonClass}
						icon={timeControl.isPaused ? mdiPlay : mdiPause}
						onClick={() => timeControl.togglePlay()}
					/>
					<IButton
						className={buttonClass}
						icon={mdiFastForward5}
						onClick={() => timeControl.goToward(5)}
					/>
					<IButton
						className={buttonClass}
						icon={mdiFastForward10}
						onClick={() => timeControl.goToward(10)}
					/>
				</div>
				<div className="d-flex">
					<IHoverElement
						toggle={
							<IButton
								className={buttonClass}
								icon={mdiDebugStepOver}
								onClick={() => {
									if (!timeControl.isPaused) timeControl.togglePlay()
								}}
							/>
						}
						position="bottom"
					>
						<IPanel alpha={9}>
							<div className="d-flex flex-column pa-4 ga-4">
								<div className="d-flex justify-end ga-4">
									<IButton
										color="primary"
										className="text-text bg-light-alpha-90 px-3 rounded-lg"
										onClick={() => {
											timeControl.goTo(new Date())
										}}
									>
										<div className="d-flex align-center ga-2">
											<Icon path={mdiCircle} size="0.75rem" />

											<span>Live</span>
										</div>
									</IButton>
									<IButton
										color="primary"
										className="text-light bg-light-alpha-30 px-3 rounded-lg"
										onClick={() => {
											timeControl.goTo(calendarDate)
										}}
									>
										Confirm
									</IButton>
								</div>
								<ISeparator className="bg-light-alpha-20" />
								<ICalendar date={moment} onDateChange={setCalendarDate}></ICalendar>
							</div>
						</IPanel>
					</IHoverElement>

					<ISelection
						options={[
							{ id: 1, display: '1x' },
							{ id: 2, display: '2x' },
							{ id: 4, display: '4x' },
						]}
						selectedId={timeControl.speed}
						setSelectedId={(id) => {
							timeControl.setSpeed(Number(id))
						}}
						position="bottom"
					>
						<IButton className={buttonClass} icon={mdiSpeedometerSlow} />
					</ISelection>
				</div>
			</div>
		</div>
	)
}

export default TimeControlBar
