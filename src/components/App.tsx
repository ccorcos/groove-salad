import * as React from "react"
import Component from "reactive-magic/component"
import Pie from "./Pie"
import Layout from "./Layout"
import Keyboard from "./keyboard"
import getCurrentScale from "../stores/getCurrentScale"
import scaleIndex from "../stores/scaleIndex"

export default class App extends Component<{}> {
	view() {
		const scaleStore = getCurrentScale()
		const whichScale = scaleIndex.get()
		return (
			<Layout
				circle={<Pie key={whichScale} scaleStore={scaleStore} />}
				keyboard={<Keyboard key={whichScale} scaleStore={scaleStore} />}
			/>
		)
	}
}
