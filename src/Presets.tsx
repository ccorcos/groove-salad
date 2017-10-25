import * as React from "react"
import { Value } from "reactive-magic"
import Component from "reactive-magic/component"
import ColorStore from "./Color"
import SizeStore from "./Size"
import appStore from "./App"

interface PresetButtonProps {
	onClick?: (e: any) => void
	active?: boolean
}

class PresetButton extends Component<PresetButtonProps> {
	getStyle({ active }): React.CSSProperties {
		return {
			width: SizeStore.presetButtonDiameter.get(),
			height: SizeStore.presetButtonDiameter.get(),
			borderRadius: SizeStore.presetButtonDiameter.get(),
			border: `1px solid ${ColorStore.primary.get()}`,
			color: active ? ColorStore.background.get() : ColorStore.primary.get(),
			backgroundColor: active
				? ColorStore.primary.get()
				: ColorStore.background.get(),
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

export default class ScalePresets extends Component<{}> {
	getStyle(): React.CSSProperties {
		return {
			display: "flex",
			justifyContent: "space-around",
			padding: 8,
		}
	}

	view() {
		const n = appStore.scales.length
		const activeIndex = appStore.scaleIndex.get()
		const buttons = Array(n)
			.fill(0)
			.map((_, i) => {
				return (
					<PresetButton
						key={i}
						active={i === activeIndex}
						onClick={() => {
							appStore.selectScale(i)
						}}
					>
						{i}
					</PresetButton>
				)
			})
		return <div style={this.getStyle()}>{buttons}</div>
	}
}
