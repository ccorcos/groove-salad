import React from "react";
import { Component, Store } from "reactive-magic";
import SizeStore from "./stores/size";
import Playable from "./playable";
import ColorStore, { hexToRgba } from "./stores/color";
import { modPos } from "./utils/mod-math";
import Slidable from "./slidable";

function repeat(list, n) {
  let acc = [];
  for (var i = 0; i < n; i++) {
    acc = acc.concat(list);
  }
  return acc;
}

export default class Keyboard extends Component {
  getKeyboardContainerStyle() {
    return {
      display: "flex",
      flex: 1,
      marginRight: 8,
      overflow: "hidden"
    };
  }

  getKeyboardStyle({ sliding, offset }) {
    return {
      height: 200,
      flex: 1,
      borderTop: `1px solid black`,
      borderBottom: `1px solid black`,
      borderColor: hexToRgba(ColorStore.blue, 0.2),
      display: "flex",
      alignItems: "center",
      transform: `translateX(${offset.x}px)`,
      transition: !sliding ? "transform ease-in-out 0.5s" : undefined
    };
  }

  getKeyButtonStyle(isRoot) {
    return {
      flexShrink: 0,
      height: 80,
      width: 48,
      margin: 8,
      borderRadius: 4,
      backgroundColor: isRoot ? ColorStore.red : ColorStore.blue,
      opacity: 0.2
    };
  }

  onSnap = angle => {
    console.log("aw snap!");
  };

  view({ scaleStore }) {
    // need to register these as deps because we might not use them on the first render
    const scaleOffset = scaleStore.offset;
    const scaleBase = scaleStore.base;

    // playable notes in the scale
    const playableNotes = scaleStore.notes.reduce(
      (acc, on, note) => {
        if (on) {
          acc.push(note);
        }
        return acc;
      },
      []
    );

    const notesPerOctave = playableNotes.length;
    const allNotes = repeat(playableNotes, 8);

    const playableButtons = allNotes.map((note, index) => {
      const isRoot = modPos(note, 12) === modPos(scaleOffset, 12);

      const octave = Math.floor(index / notesPerOctave);
      const offsetNote = note + octave * 12;

      // Compute the index of the note where the current offset is.
      const nthNoteInScale = playableNotes.indexOf(modPos(scaleOffset, 12));
      const rootNote = scaleBase + scaleOffset;
      const rootOctave = Math.floor(rootNote / 12);
      const rootOffsetIndex = rootOctave * notesPerOctave + nthNoteInScale;
      const slide = rootOctave * notesPerOctave + nthNoteInScale;

      return (
        <Playable
          key={offsetNote}
          nth={index - slide}
          note={offsetNote}
          render={(
            {
              onMouseDown,
              onMouseUp
            }
          ) => (
            <div
              className="button"
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              style={this.getKeyButtonStyle(isRoot)}
            />
          )}
        />
      );
    });

    return (
      <Slidable
        onSnap={this.onSnap}
        filterTarget={target => target.className !== "button"}
        render={(
          {
            onMouseDown,
            onMouseUp,
            onMouseMove,
            offset,
            sliding
          }
        ) => (
          <div
            style={this.getKeyboardContainerStyle()}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
          >
            <div style={this.getKeyboardStyle({ sliding, offset })}>
              {playableButtons}
            </div>
          </div>
        )}
      />
    );
  }
}
