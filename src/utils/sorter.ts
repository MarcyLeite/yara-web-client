import type { Snapshot } from '../services/connection'

export const sortByTimestamp = (a: Snapshot, b: Snapshot) => a.timestamp - b.timestamp
