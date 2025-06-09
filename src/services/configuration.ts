import type { ConnectionConfig } from './connection'
import type { ViewConfig } from './view'

export type Config = {
	modelPath: string
	connection: ConnectionConfig
	views: ViewConfig[]
}
