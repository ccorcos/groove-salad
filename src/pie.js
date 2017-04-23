import React from "react";
import { Component, Store } from "reactive-magic";
import Playable from "./playable";
import Rotatable from "./rotatable";
import ColorStore from "./stores/color";
import { modPos, modMinus, modPlus } from "./utils/mod-math";

// padding of the outer ring for spinning
const padding = 0.4;

function mergeStyles(a, b) {
  if (a.transform && b.transform) {
    return { ...a, ...b, transform: [a.transform, b.transform].join(" ") };
  }
  return { ...a, ...b };
}

class Slice extends Component {
  // source: https://hackernoon.com/a-simple-pie-chart-in-svg-dbdd653b6936

  view({ on, offset, onClick, onMouseUp, onMouseDown }) {
    const i = offset;

    // we have spacer arc
    const arc = 1 / 12;
    const spaceArc = 1 / 500;
    const noteArc = arc - spaceArc;

    // compute the path of the slice
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
    return (
      <g onClick={onClick} onMouseUp={onMouseUp} onMouseDown={onMouseDown}>
        <path
          d={notePathData}
          fill={
            i === modPos(scaleStore.offset, 12)
              ? ColorStore.red
              : ColorStore.blue
          }
          opacity={on ? 1 : 0.2}
        />
        <path key={-i - 1} d={spacePathData} fill="transparent" />
      </g>
    );
  }
}

export default class Pie extends Component {
  constructor(props) {
    super(props);
    const { scaleStore } = props;
    this.onToggles = scaleStore.notes.map((note, i) =>
      event => {
        scaleStore.notes[i] = !scaleStore.notes[i];
        scaleStore.notes = scaleStore.notes;
      });
  }

  getStyle({ rotation, rotating }) {
    return {
      height: 250,
      // align 0 at the top, and then rotate
      transform: `rotate(${-90 - 360 / 12 / 2}deg) rotate(${rotation}rad)`,
      transformOrigin: "50% 50%",
      // animate snaps
      transition: !rotating ? "transform ease-in-out 0.5s" : undefined
    };
  }

  // WARNRING: this function is fucking gnarly
  // given an angle
  onSnap = angle => {
    if (angle === 0) {
      return angle;
    }
    const { scaleStore } = this.props;
    // REMEMBER: +offset is -angle
    // Find the closest note
    // Distance to the closest note is [-6, 6]
    let distance = 99;
    // Closest note should default to the current offset
    let closest = modPos(scaleStore.offset, 12);
    // arc length
    const arc = 2 * Math.PI / 12;
    // normalize the angle relative to the offset angle.
    const normA = angle + scaleStore.offset * arc;
    scaleStore.notes.forEach((on, i) => {
      if (on) {
        // normalize i by the offset so the offset appears at angle 0
        const normI = modPos(modMinus(i, scaleStore.offset, 12), 12);
        // compute the distance to the note
        const dist = modMinus(normA, -normI * arc, 2 * Math.PI);
        if (Math.abs(dist) < Math.abs(distance)) {
          distance = dist;
          closest = i;
        }
      }
    });

    if (distance === 99) {
      return -scaleStore.offset * arc;
    }

    const offset = Math.round((-angle + distance) / 2 / Math.PI * 12);
    scaleStore.offset = offset;
    return -scaleStore.offset * arc;
  };

  view({ scaleStore }) {
    const notes = scaleStore.notes;
    const spaceArc = 1 / 500;
    const arc = 1 / 12;
    const noteArc = arc - spaceArc;
    const slices = notes.map((on, i) => {
      return (
        <Playable
          key={i}
          note={i + scaleStore.base + scaleStore.offset}
          render={({ onMouseUp, onMouseDown }) => (
            <Slice
              onMouseUp={onMouseUp}
              onMouseDown={onMouseDown}
              on={on}
              offset={i}
              onClick={this.onToggles[i]}
            />
          )}
        />
      );
    });

    // origin
    const o = -1 - padding;
    // side length
    const l = 2 + padding * 2;
    return (
      <Rotatable
        filterTarget={target => target.tagName !== "path"}
        onSnap={this.onSnap}
        render={(
          { onMouseDown, onMouseUp, onMouseMove, rotation, rotating }
        ) => (
          <svg
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            style={this.getStyle({ rotation, rotating })}
            viewBox={`${o} ${o} ${l} ${l}`}
          >
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
        )}
      />
    );
  }
}
