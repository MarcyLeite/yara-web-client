import IPanel from '../common/IPanel'
import IClock from '../common/IClock'
import TimeControlBar from './TimeControlBar'
import { PropsWithYaraStore } from '../../store'
import { useEffect, useState } from 'react'

const TimeControlPanel = ({ timeControl }: PropsWithYaraStore) => {
	const [moment, setMoment] = useState(timeControl.moment.current)

	useEffect(() => {
		const interval = setInterval(() => {
			setMoment(timeControl.moment.current)
		}, 25)
		return () => clearInterval(interval)
	}, [timeControl.moment])

	return (
		<div className="w-100 pa-4">
			<div className="d-flex w-100 justify-space-between align-end">
				<IPanel>
					<div className="w-100 align-start d-flex flex-column">
						<div className="d-flex align-strech pa-4 ga-8">
							<IClock datetime={moment} />
							<div className="d-flex flex-column justify-space-around">
								<div
									className="elevation-1 bg-light-alpha-20 rounded-pill"
									style={{ width: '100%', height: '4px' }}
								></div>
								<TimeControlBar timeControl={timeControl} moment={moment} />
							</div>
						</div>
					</div>
				</IPanel>
			</div>
		</div>
	)
}

export default TimeControlPanel
