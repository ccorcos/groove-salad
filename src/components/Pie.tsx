import * as React from "react";
import Component from "reactive-magic/component";
import Playable from "./playable";
import Rotatable from "creative-ux/components/Rotatable";
import colorStore from "../stores/Color";
import synthStore from "../stores/Synth";
import { modPos, modMinus } from "creative-ux/utils/mod-math";
import ScaleStore from "../stores/Scale"

// padding of the outer ring for spinning
const padding = 0.4;

function mergeStyles(a, b) {
  if (a.transform && b.transform) {
    return { ...a, ...b, transform: [a.transform, b.transform].join(" ") };
  }
  return { ...a, ...b };
}

interface SliceProps {
  onMouseUp: any
  onMouseDown: any
  onMouseLeave: any
  scaleStore: ScaleStore
  on: boolean
  pressed: boolean
  offset: number
  rotating: boolean
  onClick(e: any): void
}

class Slice extends Component<SliceProps> {
  // source: https://hackernoon.com/a-simple-pie-chart-in-svg-dbdd653b6936

  view(
    {
      on,
      pressed,
      offset,
      onClick,
      onMouseUp,
      onMouseDown,
      onMouseLeave,
      rotating,
      scaleStore
    }
  ) {
    const i = offset;

    const semitones = scaleStore.semitones.get();
    // we have spacer arc
    const arc = 1 / semitones;
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

    const primaryColor = colorStore.primary.get()
    const accentColor = colorStore.accent.get()
    return (
      <g
        onClick={onClick}
        onMouseUp={onMouseUp}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
      >
        <path
          d={notePathData}
          fill={
            i === modPos(scaleStore.offset.get(), semitones)
              ? accentColor
              : primaryColor
          }
          opacity={pressed ? 1 : on ? 0.6 : 0.2}
          style={{ cursor: rotating ? "all-scroll" : "pointer" }}
        />
        <path key={-i - 1} d={spacePathData} fill="transparent" />
      </g>
    );
  }
}

export interface PieProps {
  scaleStore: ScaleStore
}

export default class Pie extends Component<PieProps> {
  onToggles: Array<(e: any) => void>

  constructor(props: PieProps) {
    super(props);
    const { scaleStore } = props;
    this.onToggles = scaleStore.notes.get().map((note, i) =>
      event => {
        scaleStore.notes.update(notes => {
          notes[i] = !notes[i];
          return notes
        })
    });
  }

  getStyle({ rotation, rotating }): React.CSSProperties {
    const semitones = this.props.scaleStore.semitones.get();
    return {
      height: 250,
      // align 0 at the top, and then rotate
      transform: `rotate(${-90 - 360 / semitones / 2}deg) rotate(${rotation}rad)`,
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
    const semitones = scaleStore.semitones.get();
    // We know the arclength of each piece of pie
    const arc = 2 * Math.PI / semitones;
    // A +offset is a -angle, so we can find the normalized angle
    const normA = angle + scaleStore.offset.get() * arc;
    // To find the closest not, we need to do some modular math. The distance of normA to the note of interest will be computed to the range of [-pi, +pi] so we can compare distances and add this distance to the angle to get the place to snap to
    let distance = 99;
    // Closest note should start at the previous offset index. modPos will take the offset and return something in the range of [0, 11]
    let closest = modPos(scaleStore.offset.get(), semitones);
    scaleStore.notes.get().forEach((on, i) => {
      if (on) {
        // Normalize i by the offset, so an offset of 3 at and index of 3 is a normI of 0 and an offset of 3 at an index of 1 is 10.
        const normI = modPos(
          modMinus(i, scaleStore.offset.get(), semitones),
          semitones
        );
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
    scaleStore.offset.set(Math.round((-angle + distance) / arc))
    // Snap to the offset!
    return -scaleStore.offset.get() * arc;
  };

  viewSlices({ scaleStore, rotating }: { scaleStore: ScaleStore, rotating: boolean}) {
    const notes = scaleStore.notes.get();
    const semitones = scaleStore.semitones.get();
    const spaceArc = 1 / 500;
    const arc = 1 / semitones;
    const noteArc = arc - spaceArc;
    return notes.map((on, i) => {
      // the circle spins so we need to offset the note index as well.
      const noteIndex = modPos(i - scaleStore.offset.get(), semitones);
      const note = noteIndex + scaleStore.base.get() + scaleStore.offset.get();

      let pressed = false;
      const keys = Object.keys(synthStore.pressed.get())
      keys.forEach(pressedNote => {
        if (modPos(parseInt(pressedNote), semitones) === modPos(note, semitones)) {
          pressed = true;
        }
      });
      return (
        <Playable
          scaleStore={scaleStore}
          key={note}
          note={note}
          render={({ onMouseUp, onMouseDown, onMouseLeave }) => (
            <Slice
              onMouseUp={onMouseUp}
              onMouseDown={onMouseDown}
              onMouseLeave={onMouseLeave}
              scaleStore={scaleStore}
              on={on}
              pressed={pressed}
              offset={i}
              rotating={rotating}
              onClick={this.onToggles[i]}
            />
          )}
        />
      );
    });
  }

  view({ scaleStore }: PieProps) {
    // origin
    const o = -1 - padding;
    // side length
    const l = 2 + padding * 2;
    return (
      <Rotatable
        filterTarget={target => (target as Element).tagName !== "path"}
        onSnap={this.onSnap}
        onChange={this.onSnap}
        render={(
          {
            onMouseDown,
            rotation,
            rotating
          }
        ) => (
          <svg
            onMouseDown={onMouseDown}
            style={this.getStyle({ rotation, rotating })}
            viewBox={`${o} ${o} ${l} ${l}`}
          >
            <circle
              cx="0"
              cy="0"
              r={l / 2}
              fill="transparent"
              stroke={colorStore.primary.get()}
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
