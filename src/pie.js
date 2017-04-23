import React from "react";
import { Component, Store } from "reactive-magic";
import Playable from "./playable";

const keyboard = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];

export default class ScalePie extends Component {
  constructor(props) {
    super(props);
    const { scaleStore } = props;
    this.onToggles = scaleStore.notes.map((note, i) =>
      event => {
        scaleStore.notes[i] = !scaleStore.notes[i];
        scaleStore.notes = scaleStore.notes;
        return;
      });
  }

  view({ scaleStore }) {
    const notes = scaleStore.notes;
    const spaceArc = 1 / 500;
    const arc = 1 / 12;
    const noteArc = arc - spaceArc;
    const slices = notes
      .map((on, i) => {
        const startX = Math.cos(2 * Math.PI * arc * i);
        const startY = Math.sin(2 * Math.PI * arc * i);
        const endX = Math.cos(2 * Math.PI * (arc * i + noteArc));
        const endY = Math.sin(2 * Math.PI * (arc * i + noteArc));
        const spaceX = Math.cos(2 * Math.PI * (arc * i + noteArc + spaceArc));
        const spaceY = Math.sin(2 * Math.PI * (arc * i + noteArc + spaceArc));
        const notePathData = [
          `M ${startX} ${startY}`, // Move
          `A 1 1 0 0 1 ${endX} ${endY}`, // Arc
          `L 0 0` // Line
        ].join(" ");
        const spacePathData = [
          `M ${endX} ${endY}`, // Move
          `A 1 1 0 0 1 ${spaceX} ${spaceY}`, // Arc
          `L 0 0` // Line
        ].join(" ");
        return [
          <Playable
            key={i}
            character={keyboard[i]}
            note={i + 50}
            element={
              <path
                onClick={this.onToggles[i]}
                d={notePathData}
                fill={"CornflowerBlue"}
                opacity={on ? 1 : 0.1}
              />
            }
          />,
          <path key={-i - 1} d={spacePathData} fill="transparent" />
        ];
      })
      .reduce((acc, list) => acc.concat(list), []);
    return (
      <svg style={ScalePie.svgStyle} viewBox="-1 -1 2 2">
        {slices}
      </svg>
    );
  }

  static svgStyle = {
    height: 200,
    transform: "rotate(-90deg)"
  };
}
