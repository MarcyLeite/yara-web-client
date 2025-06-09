import type { View, ViewConfig } from '.'

export const viewToOptions = (viewList: View[] | ViewConfig[]) => {
	return viewList.map((view, i) => ({
		title: view.display,
		value: i,
	}))
}
