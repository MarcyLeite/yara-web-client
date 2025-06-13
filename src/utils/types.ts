export type Optional<T> = T | null

export const fixValue = <T>(o: T | undefined, v: T) => (o !== undefined ? o : v)
