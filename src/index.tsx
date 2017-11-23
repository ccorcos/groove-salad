import * as React from "react"
import * as ReactDOM from "react-dom"
import R from "ramda"
import { css } from "glamor"
import { Value, DerivedValue } from "reactive-magic"
import Component from "reactive-magic/component"
import Pie from "./components/Pie"
import Layout from "./components/Layout"
import Keyboard from "./components/keyboard"
import appStore from "./stores/App"
import initReactFastclick from "react-fastclick"
import Promise from "promise-polyfill"
import "whatwg-fetch"
import Tone from "tone"
import StartAudioContext from "startaudiocontext"
import * as major from "file-loader!../assets/major.png"
import * as minor from "file-loader!../assets/dorian.png"

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
	private info = new Value(false)

	private renderInfo() {
		return (
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
				}}
			>
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: "black",
						opacity: 0.6,
					}}
				/>
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						overflow: "auto",
						padding: "2em",
					}}
					onClick={e => {
						if (e.target === e.currentTarget) {
							this.info.update(value => !value)
						}
					}}
				>
					<div
						style={{
							padding: "1em 2em",
							maxWidth: "30em",
							margin: "auto",
							fontSize: 18,
							fontFamily: "Georgia,Cambria,'Times New Roman',Times,serif",
							background: "white",
							borderRadius: 6,
						}}
					>
						<p style={{ textAlign: "right", margin: 0 }}>
							<button
								style={{
									outline: "none",
									border: "none",
									background: "transparent",
									cursor: "pointer",
									display: "inline",
									fontSize: 18,
									padding: 0,
									fontFamily: "Georgia,Cambria,'Times New Roman',Times,serif",
								}}
								onClick={() => this.info.update(value => !value)}
							>
								Close
							</button>
						</p>
						<p>
							The Groove Salad is an instrument with the goal of making it easy
							for anyone to join in a jam session. I designed the interface to
							relflect the mental model I have in my head when I'm playing music
							but you don't need to know any music theory or really anything
							about music. I'm going to include some fancy vocabulary in this
							explanation because its interesting for those who know some music
							theory, but just skip over if you don't understand.
						</p>
						<p>
							To play the instrument, select a set of notes from the pie on the
							left&mdash;this is your scale. Those notes get laid out on the
							keyboad to the right. On a desktop, use can use the asdf row of
							keys to play the notes.
						</p>
						<p>For example, here is the major scale.</p>
						<p style={{ maxWidth: 300, margin: "auto" }}>
							<img src={major} style={{ maxWidth: "100%" }} />
						</p>
						<p>
							You can rotate the pie to create different modes and the keyboard
							will slide around accordingly. For example, here's the second mode
							of the major scale.
						</p>
						<p style={{ maxWidth: 300, margin: "auto" }}>
							<img src={minor} style={{ maxWidth: "100%" }} />
						</p>
						<p>
							Now if you play several notes at the same time to play a chord,
							you can rotate the pie to change the chord without moving your
							fingers. You can play an entire chord progression this way just by
							rotating the pie!
						</p>
						<p>
							Ideally, this instrument would have a tool that allows you to
							visualize the frequencies from a microphone on the pie (similar to{" "}
							<a href="https://ccorcos.github.io/circle/">Circle</a>) allowing
							you to easily find all of the "right" notes when hopping into a
							jam session. It would also be convenient to have some presets
							where you can save scales so you can change between scales during
							a jam.
						</p>
						<p>
							Sadly, this instrument isn't as playable as I'd like. Playing
							something on a screen is nothing like playing a real phsical
							instrument. But there are still some interesting things I've
							discovered from this instrument.
						</p>
						<ul>
							<li>The pentatonic scale is the inverse of the major scale.</li>
							<li>
								The tritone substitution is simply a reflection of a chord on
								the pie!
							</li>
						</ul>
						<p>
							That's it for now. Please let me know if you discover anything
							interesting from this!
						</p>
					</div>
				</div>
			</div>
		)
	}

	private renderToggleButton(text: string) {
		return (
			<div
				style={{
					position: "absolute",
					top: 0,
					right: 0,
					padding: "4px 6px",
					zIndex: 99,
				}}
			>
				<button
					style={{
						outline: "none",
						border: "none",
						background: "transparent",
						cursor: "pointer",
						fontSize: 14,
						padding: 0,
						fontFamily: "Georgia,Cambria,'Times New Roman',Times,serif",
					}}
					onClick={() => this.info.update(value => !value)}
				>
					{text}
				</button>
			</div>
		)
	}

	view() {
		const scaleStore = appStore.getCurrentScale()
		const whichScale = appStore.scaleIndex.get()
		return (
			<div>
				<Layout
					circle={<Pie key={whichScale} scaleStore={scaleStore} />}
					keyboard={<Keyboard key={whichScale} scaleStore={scaleStore} />}
				/>
				{this.renderToggleButton("What is this?")}
				{this.info.get() && this.renderInfo()}
				<a
					style={{
						position: "absolute",
						bottom: 0,
						right: 0,
						fontFamily: "monospace",
						padding: "4px 6px",
						zIndex: 99,
					}}
					href="https://github.com/ccorcos/groove-salad"
					target="_blank"
				>
					source code
				</a>
			</div>
		)
	}
}

const root = document.createElement("div")
root.style.height = "100vh"
root.style.width = "100vw"
document.body.appendChild(root)

ReactDOM.render(<App />, root)
