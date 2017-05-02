import * as React from "react";
import Component from "reactive-magic/component";
import windowSize from "../stores/WindowSize";

interface LayoutProps {
  circle: JSX.Element
  keyboard: JSX.Element
}

export default class Layout extends Component<LayoutProps> {
  getOrientation() {
    const { height, width } = windowSize.get();
    if (height > width) {
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
