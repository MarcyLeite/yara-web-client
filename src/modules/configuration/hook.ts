import { useCallback, useEffect, useState } from 'react'
import { YaraComponentConfig, YaraViewConfig } from '../views/factory'
import axios from 'axios'
import { YaraConnectionConfig } from '../consumer/connection'

export type YaraConfig = {
	'model-path': string
	connection: YaraConnectionConfig
	views: YaraViewConfig[]
}

export const useConfiguration = (configUrl: string) => {
	const configJsonPath = `${configUrl}/config.json`
	const [modelPath, setModelPath] = useState<string | null>(null)
	const [views, setViews] = useState<YaraViewConfig[] | null>(null)
	const [connection, setConnection] = useState<YaraConnectionConfig | null>(null)

	const [isLoaded, setIsLoaded] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [failMessage, setFailMessage] = useState<string | null>(null)

	const fetchConfig = useCallback(async () => {
		const response = await axios.get(configJsonPath)
		const data: YaraConfig = response.data

		setModelPath(`${data['model-path']}`)
		setViews(data.views)
		setConnection(data.connection)

		setIsLoaded(true)
	}, [configJsonPath])

	useEffect(() => {
		fetchConfig()
	}, [fetchConfig])

	const updateViewConfig = (index: number, newView: Omit<YaraViewConfig, 'components'>) => {
		if (!views) {
			throw new Error('Runtime Error: No views loaded')
		}
		const newViews = [...views]
		const originalView = newViews[index]
		const updateView = Object.assign({ components: originalView.components }, newView)
		newViews[index] = updateView

		setViews(newViews)
		save(newViews)
	}

	const createViewConfig = (newView: Omit<YaraViewConfig, 'components'>) => {
		if (!views) {
			throw new Error('Runtime Error: No views loaded')
		}
		const newViews = [...views]
		newViews.push(Object.assign({ components: [] }, newView))

		setViews(newViews)
	}

	const updateComponentConfig = (viewIndex: number, newComponent: YaraComponentConfig) => {
		if (!views) {
			throw new Error('Runtime Error: No views loaded')
		}
		if (viewIndex < 0 || viewIndex >= views.length) {
			throw new Error('Runtime Error: View out of index')
		}

		const newViews = [...views]
		const updateView = Object.assign({}, newViews[viewIndex])
		const components = [...updateView.components]
		const toUpdateComponent = components.findIndex((c) => c.id === newComponent.id)

		if (toUpdateComponent < 0) {
			components.push(newComponent)
		} else {
			components[toUpdateComponent] = newComponent
		}

		updateView.components = components
		newViews[viewIndex] = updateView

		setViews(newViews)
		save(newViews)
	}

	const toJson = useCallback(() => {
		return JSON.stringify({ 'model-path': modelPath, connection, views }, null, 2)
	}, [modelPath, connection, views])

	const save = async (newViews: YaraViewConfig[]) => {
		setIsSaving(true)
		try {
			await axios.post(configJsonPath, { 'model-path': modelPath, connection, views: newViews })
		} catch (e) {
			setFailMessage('Fail to save')
			throw e
		}
		setIsSaving(false)
	}

	return {
		modelPath,
		views,
		connection,
		updateViewConfig,
		createViewConfig,
		updateComponentConfig,
		toJson,
		isLoaded,
		isSaving,
		failMessage,
	}
}

export type YaraConfiguration = ReturnType<typeof useConfiguration>
