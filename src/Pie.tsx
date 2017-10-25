import * as React from "react"
import Component from "reactive-magic/component"
import Playable from "./playable"
import Rotatable from "./Rotatable"
import primary from "./primary"
import pressedNotes from "./pressedNotes"
import modMinus from "./modMinus"
import modPos from "./modPos"
import ScaleStore from "./Scale"
import SizeStore from "./Size"
import Slice from "./Slice"

// padding of the outer ring for spinning
const padding = 0.4

export interface PieProps {
	scaleStore: ScaleStore
}

export default class Pie extends Component<PieProps> {
	onToggles: Array<(e: any) => void>

	constructor(props: PieProps) {
		super(props)
		const { scaleStore } = props
		this.onToggles = scaleStore.notes.get().map((note, i) => event => {
			scaleStore.notes.update(notes => {
				notes[i] = !notes[i]
				return notes
			})
		})
	}

	getStyle({ rotation, rotating }): React.CSSProperties {
		const semitonesPerOctave = this.props.scaleStore.semitonesPerOctave.get()
		return {
			height: SizeStore.pieDiameter.get(),
			// align 0 at the top, and then rotate
			transform: `rotate(${-90 -
				360 / semitonesPerOctave / 2}deg) rotate(${rotation}rad)`,
			transformOrigin: "50% 50%",
			// animate snaps
			transition: !rotating ? "transform ease-in-out 0.5s" : undefined,
		}
	}

	// WARNING: this function is fucking gnarly
	// given an angle (in radians) and the offset that we're currently snapped to in the scale, we need to determine the closest note thats in the scale that we can snap to, accounting for the rotation so we can go up and down octaves
	// REMEMBER: +offset is -angle
	onSnap = angle => {
		const { scaleStore } = this.props
		const semitonesPerOctave = scaleStore.semitonesPerOctave.get()
		// We know the arclength of each piece of pie
		const arc = 2 * Math.PI / semitonesPerOctave
		// A +offset is a -angle, so we can find the normalized angle
		const normA = angle + scaleStore.semitoneOffset.get() * arc
		// To find the closest not, we need to do some modular math. The distance of normA to the note of interest will be computed to the range of [-pi, +pi] so we can compare distances and add this distance to the angle to get the place to snap to
		let distance = 99
		// Closest note should start at the previous offset index. modPos will take the offset and return something in the range of [0, 11]
		let closest = modPos(scaleStore.semitoneOffset.get(), semitonesPerOctave)
		scaleStore.notes.get().forEach((on, i) => {
			if (on) {
				// Normalize i by the offset, so an offset of 3 at and index of 3 is a normI of 0 and an offset of 3 at an index of 1 is 10.
				const normI = modPos(
					modMinus(i, scaleStore.semitoneOffset.get(), semitonesPerOctave),
					semitonesPerOctave
				)
				// Compute the distance to a note
				const dist = modMinus(normA, -normI * arc, 2 * Math.PI)
				if (Math.abs(dist) < Math.abs(distance)) {
					distance = dist
					closest = i
				}
			}
		})
		// If we don't have any notes on, then nap back to the previous offset
		if (distance === 99) {
			return -scaleStore.semitoneOffset.get() * arc
		}
		// Add the distance to the closest note to the angle, and then divide by the arc length to get the offset. We'll round due to floating point precision
		scaleStore.semitoneOffset.set(Math.round((-angle + distance) / arc))
		// Snap to the offset!
		return -scaleStore.semitoneOffset.get() * arc
	}

	viewSlices({
		scaleStore,
		rotating,
	}: {
		scaleStore: ScaleStore
		rotating: boolean
	}) {
		const notes = scaleStore.notes.get()
		const semitonesPerOctave = scaleStore.semitonesPerOctave.get()
		return notes.map((on, i) => {
			// the circle spins so we need to offset the note index as well.
			const noteIndex = modPos(
				i - scaleStore.semitoneOffset.get(),
				semitonesPerOctave
			)
			const note =
				noteIndex +
				scaleStore.baseSemitone.get() +
				scaleStore.semitoneOffset.get()

			let pressed = false
			const keys = Object.keys(pressedNotes.get())
			keys.forEach(pressedNote => {
				if (
					modPos(parseInt(pressedNote), semitonesPerOctave) ===
					modPos(note, semitonesPerOctave)
				) {
					pressed = true
				}
			})
			return (
				<Playable
					scaleStore={scaleStore}
					key={note}
					note={note}
					render={({ onMouseDown, onTouchStart }) => (
						<Slice
							onMouseDown={onMouseDown}
							onTouchStart={onTouchStart}
							scaleStore={scaleStore}
							on={on}
							pressed={pressed}
							offset={i}
							rotating={rotating}
							onClick={this.onToggles[i]}
						/>
					)}
				/>
			)
		})
	}

	view({ scaleStore }: PieProps) {
		// origin
		const o = -1 - padding
		// side length
		const l = 2 + padding * 2
		return (
			<Rotatable
				filterTarget={target => (target as Element).tagName !== "path"}
				onSnap={this.onSnap}
				onChange={this.onSnap}
				render={({ onMouseDown, onTouchStart, rotation, rotating }) => (
					<svg
						onMouseDown={onMouseDown}
						onTouchStart={onTouchStart}
						style={this.getStyle({ rotation, rotating })}
						viewBox={`${o} ${o} ${l} ${l}`}
					>
						<circle
							cx="0"
							cy="0"
							r={l / 2}
							fill="transparent"
							stroke={primary.get()}
							strokeWidth={0.01}
							opacity={0.2}
							style={{ cursor: "all-scroll" }}
						/>
						{this.viewSlices({ scaleStore, rotating })}
					</svg>
				)}
			/>
		)
	}
}
