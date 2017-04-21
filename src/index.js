import React from "react";
import ReactDOM from "react-dom";
import R from "ramda";
import { css } from "glamor";
import { Component, Store } from "reactive-magic";

// TODO
// - zoom, move, drag on canvas
// -

css.global("html, body", {
  padding: 0,
  margin: 0,
  overflow: "hidden"
});

// normalize x with respect to the rect
const _x = (x, r) => r.x + x * r.w * r.z;
const _y = (y, r) => r.y + y * r.h * r.z;
const _z = (z, r) => z * r.z;
const _w = (w, r) => w * r.w;
const _h = (h, r) => h * r.h;

export default class Scale extends Component {
  store = Store({ notes: Array(12).fill(false) });

  constructor(props) {
    super(props);
    this.onToggles = this.store.notes.map((note, i) =>
      event => {
        this.store.notes[i] = !this.store.notes[i];
        this.store.notes = this.store.notes;
        return;
      });
  }

  static defaultProps = {
    octaves: 1,
    rect: { x: 0.25, y: 0, z: 1, w: 0.5, h: 0.1 }
  };

  view({ octaves, rect }) {
    const length = octaves * 12;
    return (
      <svg height="100vh" width="100vw" viewBox="0 0 1 1" overflow="scroll">
        <rect
          x={rect.x}
          width={_w(1, rect)}
          height={_h(1, rect)}
          stroke="black"
          strokeWidth={_z(0.002, rect)}
          fill="transparent"
        />
        {R.range(0, length).map(i => {
          return (
            <circle
              key={i}
              cx={_x(i / (length - 1), rect)}
              cy={_y(0.5, rect)}
              r={_z(0.01, rect)}
              stroke="black"
              strokeWidth={_z(0.002, rect)}
              fill={
                this.store.notes[i] ? "rgb(85, 233, 158)" : "rgb(190, 196, 193)"
              }
              onClick={this.onToggles[i]}
            />
          );
        })}
      </svg>
    );
  }
}

function app() {
  return <Scale />;
}

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(app(), root);
