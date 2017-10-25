import * as React from "react"
import Component from "reactive-magic/component"
import primary from "./primary"
import background from "./background"
import SizeStore from "./Size"

interface PresetButtonProps {
	onClick?: (e: any) => void
	active?: boolean
}

export default class PresetButton extends Component<PresetButtonProps> {
	getStyle({ active }): React.CSSProperties {
		return {
			width: SizeStore.presetButtonDiameter.get(),
			height: SizeStore.presetButtonDiameter.get(),
			borderRadius: SizeStore.presetButtonDiameter.get(),
			border: `1px solid ${primary.get()}`,
			color: active ? background.get() : primary.get(),
			backgroundColor: active ? primary.get() : background.get(),
			opacity: active ? 1 : 0.4,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontFamily: "sans-serif",
		}
	}

	view({ onClick, active }) {
		return (
			<div onClick={onClick} style={this.getStyle({ active })}>
				{this.props.children}
			</div>
		)
	}
}
