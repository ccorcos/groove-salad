import * as React from "react"
import * as ReactDOM from "react-dom"
import R from "ramda"
import { css } from "glamor"
import { Value, DerivedValue } from "reactive-magic"
import Component from "reactive-magic/component"
import Pie from "./Pie"
import Layout from "./Layout"
import Keyboard from "./keyboard"
import appStore from "./App"
import initReactFastclick from "react-fastclick"
import Promise from "promise-polyfill"
import "whatwg-fetch"
import Tone from "tone"
import StartAudioContext from "startaudiocontext"

StartAudioContext(Tone.context, "body")

initReactFastclick()

// To add to window
if (!window["Promise"]) {
	window["Promise"] = Promise
}

css.global("html, body", {
	padding: 0,
	margin: 0,
	overflow: "hidden",
	position: "fixed",
	WebkitTapHighlightColor: "transparent",
})

const noScrollbar = css({
	"::-webkit-scrollbar": {
		display: "none",
	},
})

export default class App extends Component<{}> {
	view() {
		const scaleStore = appStore.getCurrentScale()
		const whichScale = appStore.scaleIndex.get()
		return (
			<Layout
				circle={<Pie key={whichScale} scaleStore={scaleStore} />}
				keyboard={<Keyboard key={whichScale} scaleStore={scaleStore} />}
			/>
		)
	}
}

const root = document.createElement("div")
root.style.height = "100vh"
root.style.width = "100vw"
document.body.appendChild(root)

ReactDOM.render(<App />, root)
