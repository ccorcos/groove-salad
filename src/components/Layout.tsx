import * as React from "react";
import Component from "reactive-magic/component";

interface LayoutProps {
  circle: JSX.Element
  keyboard: JSX.Element
}

export default class Layout extends Component<LayoutProps> {
  getOrientation() {
    return {
      height: "100vh",
      width: "100vw",
      transform: "rotate(0deg)"
    };
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
