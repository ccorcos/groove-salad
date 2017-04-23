import React from "react";
import ReactDOM from "react-dom";
import R from "ramda";
import { css } from "glamor";
import { Component, Store } from "reactive-magic";
import ScalePie from "./pie";

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

const ScaleStore = Store({ notes: Array(12).fill(false) });

export default class App extends Component {
  view() {
    return <ScalePie scaleStore={ScaleStore} />;
  }
}

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(<App />, root);
