import React from "react";
import { Component, Store } from "reactive-magic";
import SizeStore from "./stores/size";
import Playable from "./playable";
import ColorStore from "./stores/color";
import { modPos } from "./utils/mod-math";

function repeat(list, n) {
  let acc = [];
  for (var i = 0; i < n; i++) {
    acc = acc.concat(list);
  }
  return acc;
}

export default class Keyboard extends Component {
  getKeyboardStyle() {
    return {
      height: 250,
      flex: 1,
      display: "flex",
      alignItems: "center"
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
      const scaleNote = scaleBase + scaleOffset;
      const scaleOctave = Math.floor(scaleNote / 12);
      const rootOffsetIndex = scaleOctave * notesPerOctave + nthNoteInScale;
      const slide = scaleOctave * notesPerOctave + nthNoteInScale;

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
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              style={this.getKeyButtonStyle(isRoot)}
            />
          )}
        />
      );
    });

    return <div style={this.getKeyboardStyle()}>{playableButtons}</div>;
  }
}
