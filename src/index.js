import React from "react";
import ReactDOM from "react-dom";
import R from "ramda";
import { css } from "glamor";
import { Component, Store } from "reactive-magic";
import ScalePie from "./pie";
import Layout from "./layout";
import Keyboard from "./keyboard";

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

const ScaleStore = Store({
  offset: 0,
  // base MUST be a fraction of 12
  base: 48,
  baseFreq: 440,
  notes: Array(12).fill(false)
});

window.scaleStore = ScaleStore;

export default class App extends Component {
  view() {
    return (
      <Layout
        circle={<ScalePie scaleStore={ScaleStore} />}
        keyboard={<Keyboard scaleStore={ScaleStore} />}
      />
    );
  }
}

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(<App />, root);
