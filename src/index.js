import React from "react";
import ReactDOM from "react-dom";
import R from "ramda";
import { css } from "glamor";
import { Component, Store, Value, Derive } from "reactive-magic";
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

const semitones = Value(12);
const ScaleStore = Store({
  offset: 0,
  semitones,
  base: Derive(() => semitones() * 4),
  notes: Array(semitones()).fill(false),
  baseFreq: 440
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
