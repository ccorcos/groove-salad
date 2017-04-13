import React from "react";
import { Component } from "reactive-magic";
import MouseStore from "./mouse";

const r = 10;

export default class Ball extends Component {
  getStyle() {
    return {
      position: "absolute",
      top: MouseStore.y - r,
      left: MouseStore.x - r,
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      backgroundColor: "blue",
      pointerEvents: "none"
    };
  }
  view() {
    return <div style={this.getStyle()} />;
  }
}
