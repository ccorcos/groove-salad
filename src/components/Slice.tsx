import * as React from "react"
import Component from "reactive-magic/component"
import modPos from "../helpers/modPos"
import ScaleStore from "../stores/Scale"
import primary from "../colors/primary"
import accent from "../colors/accent"

interface SliceProps {
	onMouseDown: any
	onTouchStart: any
	scaleStore: ScaleStore
	on: boolean
	pressed: boolean
	offset: number
	rotating: boolean
	onClick(e: any): void
}

export default class Slice extends Component<SliceProps> {
	// source: https://hackernoon.com/a-simple-pie-chart-in-svg-dbdd653b6936

	view({
		on,
		pressed,
		offset,
		onClick,
		onMouseDown,
		onTouchStart,
		rotating,
		scaleStore,
	}: SliceProps) {
		const i = offset

		const semitonesPerOctave = scaleStore.semitonesPerOctave.get()
		// we have spacer arc
		const arc = 1 / semitonesPerOctave
		const spaceArc = 1 / 500
		const noteArc = arc - spaceArc

		// compute the path of the slice
		const startX = Math.cos(2 * Math.PI * arc * i)
		const startY = Math.sin(2 * Math.PI * arc * i)
		const endX = Math.cos(2 * Math.PI * (arc * i + noteArc))
		const endY = Math.sin(2 * Math.PI * (arc * i + noteArc))
		const spaceX = Math.cos(2 * Math.PI * (arc * i + noteArc + spaceArc))
		const spaceY = Math.sin(2 * Math.PI * (arc * i + noteArc + spaceArc))
		const notePathData = [
			`M ${startX} ${startY}`, // Move
			`A 1 1 0 0 1 ${endX} ${endY}`, // Arc
			`L 0 0`, // Line
		].join(" ")
		const spacePathData = [
			`M ${endX} ${endY}`, // Move
			`A 1 1 0 0 1 ${spaceX} ${spaceY}`, // Arc
			`L 0 0`, // Line
		].join(" ")

		const primaryColor = primary.get()
		const accentColor = accent.get()
		return (
			<g
				onClick={onClick}
				onMouseDown={onMouseDown}
				onTouchStart={onTouchStart}
			>
				<path
					d={notePathData}
					fill={
						i === modPos(scaleStore.semitoneOffset.get(), semitonesPerOctave)
							? accentColor
							: primaryColor
					}
					opacity={pressed ? 1 : on ? 0.6 : 0.2}
					style={{ cursor: rotating ? "all-scroll" : "pointer" }}
				/>
				<path key={-i - 1} d={spacePathData} fill="transparent" />
			</g>
		)
	}
}
