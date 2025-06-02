import type { ConnectionConfig } from './connection'
import type { ViewConfig } from './view'

export type Config = {
	connection: ConnectionConfig
	views: ViewConfig[]
}
