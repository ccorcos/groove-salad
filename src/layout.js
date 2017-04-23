import React from "react";
import { Component, Store } from "reactive-magic";
import SizeStore from "./size";

export default class Layout extends Component {
  getOrientation() {
    if (SizeStore.height > SizeStore.width) {
      return {
        height: "100vw",
        width: "100vh",
        transform: "rotate(90deg) translateY(-100%)"
      };
    } else {
      return {
        height: "100vh",
        width: "100vw",
        transform: "rotate(0deg)"
      };
    }
  }

  getStyle() {
    return Object.assign(this.getOrientation(), {
      transformOrigin: "top left",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });
  }

  view(props) {
    return (
      <div style={this.getStyle()}>
        <div style={{ flex: 1 }}>
          {props.circle}
        </div>
        <div style={{ flex: 1 }}>
          {props.keyboard}
        </div>
      </div>
    );
  }
}
