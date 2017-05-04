import * as React from "react";
import Component from "reactive-magic/component";
import WindowSize from "../stores/WindowSize"

interface LayoutProps {
  circle: JSX.Element
  keyboard: JSX.Element
}

export default class Layout extends Component<LayoutProps> {
  getOrientation() {
    const { height, width } = WindowSize.get()
    if (width > height) {
      return {
        height: "100vh",
        width: "100vw",
        transform: "rotate(0deg)"
      };
    } else {
      return {
        height: "100vw",
        width: "100vh",
        transform: "rotate(90deg) translateX(-100vw)",
        transformOrigin: "bottom left 0px"
      }
    }
  }

  getStyle() {
    return Object.assign(this.getOrientation(), {
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    });
  }

  view(props: LayoutProps) {
    return (
      <div style={this.getStyle()}>
        <div style={{ padding: 8 }}>
          {props.circle}
        </div>
        {props.keyboard}
      </div>
    );
  }
}
