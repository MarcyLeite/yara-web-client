export const getRandomInt = (min: number, max: number, random?: Math['random']) => {
	const randomCallback = random ?? Math.random
	const minCeiled = Math.ceil(min)
	const maxFloored = Math.floor(max)
	return Math.floor(randomCallback() * (maxFloored - minCeiled) + minCeiled)
}
