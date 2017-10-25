import * as React from "react"
import Component from "reactive-magic/component"
import PresetButton from "./PresetButton"
import scales from "./scales"
import scaleIndex from "./scaleIndex"
import selectScale from "./selectScale"

export default class ScalePresets extends Component<{}> {
	getStyle(): React.CSSProperties {
		return {
			display: "flex",
			justifyContent: "space-around",
			padding: 8,
		}
	}

	view() {
		const n = scales.length
		const activeIndex = scaleIndex.get()
		const buttons = Array(n)
			.fill(0)
			.map((_, i) => {
				return (
					<PresetButton
						key={i}
						active={i === activeIndex}
						onClick={() => {
							selectScale(i)
						}}
					>
						{i}
					</PresetButton>
				)
			})
		return <div style={this.getStyle()}>{buttons}</div>
	}
}
