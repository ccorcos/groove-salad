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

  view({ on, offset, onClick, onMouseUp, onMouseDown, rotating }) {
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
          style={{ cursor: rotating ? "all-scroll" : "pointer" }}
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

  // WARNING: this function is fucking gnarly
  // given an angle (in radians) and the offset that we're currently snapped to in the scale, we need to determine the closest note thats in the scale that we can snap to, accounting for the rotation so we can go up and down octaves
  // REMEMBER: +offset is -angle
  onSnap = angle => {
    const { scaleStore } = this.props;
    // We know the arclength of each piece of pie
    const arc = 2 * Math.PI / 12;
    // A +offset is a -angle, so we can find the normalized angle
    const normA = angle + scaleStore.offset * arc;
    // To find the closest not, we need to do some modular math. The distance of normA to the note of interest will be computed to the range of [-pi, +pi] so we can compare distances and add this distance to the angle to get the place to snap to
    let distance = 99;
    // Closest note should start at the previous offset index. modPos will take the offset and return something in the range of [0, 11]
    let closest = modPos(scaleStore.offset, 12);
    scaleStore.notes.forEach((on, i) => {
      if (on) {
        // Normalize i by the offset, so an offset of 3 at and index of 3 is a normI of 0 and an offset of 3 at an index of 1 is 10.
        const normI = modPos(modMinus(i, scaleStore.offset, 12), 12);
        // Compute the distance to a note
        const dist = modMinus(normA, -normI * arc, 2 * Math.PI);
        if (Math.abs(dist) < Math.abs(distance)) {
          distance = dist;
          closest = i;
        }
      }
    });
    // If we don't have any notes on, then nap back to the previous offset
    if (distance === 99) {
      return -scaleStore.offset * arc;
    }
    // Add the distance to the closest note to the angle, and then divide by the arc length to get the offset. We'll round due to floating point precision
    const offset = Math.round((-angle + distance) / arc);
    scaleStore.offset = offset;
    // Snap to the offset!
    return -scaleStore.offset * arc;
  };

  viewSlices({ scaleStore, rotating }) {
    const notes = scaleStore.notes;
    const spaceArc = 1 / 500;
    const arc = 1 / 12;
    const noteArc = arc - spaceArc;
    return notes.map((on, i) => {
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
              rotating={rotating}
              onClick={this.onToggles[i]}
            />
          )}
        />
      );
    });
  }

  view({ scaleStore }) {
    // origin
    const o = -1 - padding;
    // side length
    const l = 2 + padding * 2;
    return (
      <Rotatable
        filterTarget={target => target.tagName !== "path"}
        onSnap={this.onSnap}
        onChange={this.onSnap}
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
              style={{ cursor: "all-scroll" }}
            />
            {this.viewSlices({ scaleStore, rotating })}
          </svg>
        )}
      />
    );
  }
}
