import React from "react";
import ReactDOM from "react-dom";
import R from "ramda";
import { css } from "glamor";
import { Component, Store } from "reactive-magic";

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

// normalize x with respect to the rect
const _x = (x, r) => r.x + x * r.w * r.z;
const _y = (y, r) => r.y + y * r.h * r.z;
const _z = (z, r) => z * r.z;
const _w = (w, r) => w * r.w;
const _h = (h, r) => h * r.h;

const ScaleStore = Store({ notes: Array(12).fill(false) });

export default class Scale extends Component {
  store = ScaleStore;

  constructor(props) {
    super(props);
    this.onToggles = this.store.notes.map((note, i) =>
      event => {
        this.store.notes[i] = !this.store.notes[i];
        this.store.notes = this.store.notes;
        return;
      });
  }

  didMount() {
    this.root.scrollLeft = this.root.scrollWidth / 2 - 800 / 2;
  }

  static defaultProps = {
    octaves: 5
  };

  refRoot = node => {
    this.root = node;
  };

  view({ octaves, rect }) {
    const length = octaves * 12;
    return (
      <div
        ref={this.refRoot}
        className={noScrollbar}
        style={{
          width: 800,
          border: "1px solid black",
          borderRadius: 4,
          display: "flex",
          padding: "32px 8px 8px 8px",
          overflowX: "scroll"
        }}
      >
        <div style={{ position: "absolute", top: 4, left: 8 }}>
          select scale
        </div>
        {R.range(0, length).map(i => {
          const arrow = i % 12 === 0
            ? <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: "10px solid red"
                }}
              />
            : null;

          return (
            <div
              key={i}
              style={{
                flexShrink: 0,
                marginLeft: 8,
                marginRight: 8,
                height: 20,
                width: 20,
                backgroundColor: this.store.notes[i % 12]
                  ? "rgb(85, 233, 158)"
                  : "rgb(190, 196, 193)",
                border: "1px solid black",
                borderRadius: "100%",
                position: "relative"
              }}
              onClick={this.onToggles[i % 12]}
            >
              {arrow}
            </div>
          );
        })}
      </div>
    );
  }
}

function app() {
  return <Scale />;
}

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(app(), root);
