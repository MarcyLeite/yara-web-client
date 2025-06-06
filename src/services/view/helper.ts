import type { ViewConfig } from '.'

export const viewConfigToOptions = (configList: ViewConfig[]) => {
	return configList.map((config, i) => ({
		title: config.display,
		value: i,
	}))
}
