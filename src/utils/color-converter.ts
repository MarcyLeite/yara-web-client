const SATURATION = 100,
	LIGHTNESS = 50

export const hueToHSL = (value: number) => `hsl(${value}, ${SATURATION}%, ${LIGHTNESS}%)`
