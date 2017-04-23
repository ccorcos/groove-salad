import React from "react";
import { Component, Store } from "reactive-magic";
import SizeStore from "./size";
import Playable from "./playable";
import ColorStore from "./color";

export default class Keyboard extends Component {
  getKeyboardStyle() {
    return {
      flex: 1,
      display: "flex"
    };
  }

  getKeyButtonStyle() {
    return {
      height: 120,
      width: 80,
      margin: 8,
      borderRadius: 4,
      backgroundColor: ColorStore.primary
    };
  }

  view({ scaleStore }) {
    const playableNotes = scaleStore.notes
      .reduce(
        (acc, on, i) => {
          if (on) {
            acc.push(i);
          }
          return acc;
        },
        []
      )
      .map((i, n) => (
        <Playable
          key={i}
          nth={n}
          note={i + 50}
          element={<div style={this.getKeyButtonStyle()} />}
        />
      ));

    return <div style={this.getKeyboardStyle()}>{playableNotes}</div>;
  }
}
