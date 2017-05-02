import * as React from "react";
import * as ReactDOM from "react-dom";
import R from "ramda";
import { css } from "glamor";
import { Value, DerivedValue } from "reactive-magic";
import Component from "reactive-magic/component"
import Pie from "./components/Pie";
import Layout from "./components/Layout";
import Keyboard from "./components/keyboard";
import ScaleStore from "./stores/Scale"

css.global("html, body", {
  padding: 0,
  margin: 0,
  overflow: "hidden"
});

const noScrollbar = css({
  "::-webkit-scrollbar": {
    display: "none"
  }
});

const scaleStore = new ScaleStore()
window["scaleStore"] = scaleStore;

export default class App extends Component<{}> {
  view() {
    return (
      <Layout
        circle={<Pie scaleStore={scaleStore} />}
        keyboard={<Keyboard scaleStore={scaleStore} />}
      />
    );
  }
}

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(<App />, root);
