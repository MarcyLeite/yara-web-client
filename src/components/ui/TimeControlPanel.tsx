import IPanel from '../common/IPanel'
import IClock from '../common/IClock'
import TimeControlBar from './TimeControlBar'
import { PropsWithYaraStore } from '../../store'

const TimeControlPanel = ({ timeControl }: PropsWithYaraStore) => {
	return (
		<div className="w-100 pa-4">
			<div className="d-flex w-100 justify-space-between align-end">
				<IPanel>
					<div className="w-100 align-start d-flex flex-column">
						<div className="d-flex align-strech pa-4 ga-8">
							<IClock datetime={timeControl.moment} />
							<div className="d-flex flex-column justify-space-around">
								<div
									className="elevation-1 bg-light-alpha-20 rounded-pill"
									style={{ width: '100%', height: '4px' }}
								></div>
								<TimeControlBar timeControl={timeControl} />
							</div>
						</div>
					</div>
				</IPanel>
			</div>
		</div>
	)
}

export default TimeControlPanel
