import { ReactNode } from 'react'

type Props = {
	topRight?: ReactNode
	topLeft?: ReactNode
}

const IOverlay = ({ topRight, topLeft }: Props) => {
	return (
		<div className="i-overlay p-absolute w-100 h-100 top-0 pointer-events-none">
			<div className="p-relative w-100 h-100">
				<div className="i-overlay-element w-fit-content i-overlay-top-left pointer-events-all">
					{topLeft}
				</div>
				<div className="i-overlay-element w-fit-content i-overlay-top-right pointer-events-all">
					{topRight}
				</div>
			</div>
		</div>
	)
}

export default IOverlay
