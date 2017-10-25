import * as React from "react"
import * as ReactDOM from "react-dom"
import { css } from "glamor"
import initReactFastclick from "react-fastclick"
import Promise from "promise-polyfill"
import "whatwg-fetch"
import Tone from "tone"
import StartAudioContext from "startaudiocontext"
import selectScaleFromKeyPress from "./selectScaleFromKeyPress"
import App from "./App"

StartAudioContext(Tone.context, "body")

initReactFastclick()
window.addEventListener("keypress", selectScaleFromKeyPress)

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

const root = document.createElement("div")
root.style.height = "100vh"
root.style.width = "100vw"
document.body.appendChild(root)

ReactDOM.render(<App />, root)
