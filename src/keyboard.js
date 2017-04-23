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

  getKeyButtonStyle(i) {
    return {
      height: 80,
      width: 48,
      margin: 8,
      borderRadius: 4,
      backgroundColor: i === 0 ? ColorStore.red : ColorStore.blue,
      opacity: 0.2
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
          note={i + scaleStore.base}
          render={() => <div style={this.getKeyButtonStyle(i)} />}
        />
      ));

    return <div style={this.getKeyboardStyle()}>{playableNotes}</div>;
  }
}
