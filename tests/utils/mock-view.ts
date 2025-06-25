import { createView, ViewConfig } from '../../src/modules/view'

export const mockViewConfig: ViewConfig = {
	display: 'Thermal View',
	mapper: {
		type: 'thermal',
		min: 0,
		max: 100,
	},
	components: [
		{
			id: '0',
			display: 'Panel #1',
			indexerList: ['foo'],
		},
		{
			id: '1',
			display: 'Panel #2',
			indexerList: ['bar'],
		},
		{
			id: '2',
			display: 'Panel #3',
			isHidden: true,
		},
		{
			id: '3',
			display: 'Panel #4',
			indexerList: ['foo', 'bar'],
			compute: 'foo.eng - bar.raw',
		},
	],
}

export const mockView = createView(mockViewConfig)
