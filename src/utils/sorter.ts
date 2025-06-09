import type { Snapshot } from '../modules/connection/connection'

export const sortByTimestamp = (a: Snapshot, b: Snapshot) => a.timestamp - b.timestamp
