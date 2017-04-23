import React from "react";
import { Component, Store } from "reactive-magic";
import Playable from "./playable";
import Rotatable from "./rotatable";
import ColorStore from "./color";

// padding of the outer ring for spinning
const padding = 0.4;

export default class ScalePie extends Component {
  constructor(props) {
    super(props);
    const { scaleStore } = props;
    this.onToggles = scaleStore.notes.map((note, i) =>
      event => {
        scaleStore.notes[i] = !scaleStore.notes[i];
        scaleStore.notes = scaleStore.notes;
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
            note={i + scaleStore.base}
            render={() => (
              <path
                onClick={this.onToggles[i]}
                d={notePathData}
                fill={ColorStore.blue}
                opacity={on ? 1 : 0.2}
              />
            )}
          />,
          <path key={-i - 1} d={spacePathData} fill="transparent" />
        ];
      })
      .reduce((acc, list) => acc.concat(list), []);

    // origin
    const o = -1 - padding;
    // side length
    const l = 2 + padding * 2;
    return (
      <Rotatable
        filterTarget={target => target.tagName !== "path"}
        element={
          <svg style={ScalePie.svgStyle} viewBox={`${o} ${o} ${l} ${l}`}>
            <circle
              cx="0"
              cy="0"
              r={l / 2}
              fill="transparent"
              stroke={ColorStore.blue}
              strokeWidth={0.01}
              opacity={0.2}
            />
            {slices}
          </svg>
        }
      />
    );
  }

  static svgStyle = {
    height: 250,
    transform: "rotate(-90deg)"
  };
}
