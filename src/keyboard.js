import React from "react";
import { Component, Store } from "reactive-magic";
import SizeStore from "./stores/size";
import Playable from "./playable";
import ColorStore, { hexToRgba } from "./stores/color";
import { modPos } from "./utils/mod-math";
import Slidable from "./slidable";
import SynthStore from "./stores/synth";

function repeat(list, n) {
  let acc = [];
  for (var i = 0; i < n; i++) {
    acc = acc.concat(list);
  }
  return acc;
}

const buttonWidth = 48;
const buttonMargin = 8;
const buttonSize = buttonWidth + 2 * buttonMargin;
const width = buttonWidth * 6 + buttonMargin * 6 * 2;

export default class Keyboard extends Component {
  keyboardStore = Store({
    offset: 0 // inversion
  });

  getKeyboardContainerStyle() {
    return {
      display: "flex",
      margin: 8,
      overflow: "hidden",
      width: width,
      border: `1px solid black`,
      borderRadius: 4,
      borderColor: hexToRgba(ColorStore.blue, 0.2),
      cursor: "ew-resize"
    };
  }

  deriveOffsetStuff() {
    const scaleBase = this.props.scaleStore.base;
    const scaleOffset = this.props.scaleStore.offset;
    const semitones = this.props.scaleStore.semitones;
    const rootNote = scaleBase + scaleOffset;
    const rootOctave = Math.floor(rootNote / semitones);
    const playableNotes = this.getPlayableNotes();
    const notesPerOctave = playableNotes.length;
    const nthNoteInScale = playableNotes.indexOf(modPos(rootNote, semitones));
    const rootOffsetIndex = rootOctave * notesPerOctave + nthNoteInScale;
    const totalNotes = notesPerOctave * 8;
    return {
      semitones,
      scaleBase,
      scaleOffset,
      rootNote,
      rootOctave,
      playableNotes,
      notesPerOctave,
      nthNoteInScale,
      rootOffsetIndex,
      totalNotes
    };
  }

  getKeyboardStyle({ sliding, offset }) {
    const { rootOffsetIndex } = this.deriveOffsetStuff();
    return {
      height: 200,
      flex: 1,
      display: "flex",
      alignItems: "center",
      transform: `translateX(${offset.x - rootOffsetIndex * buttonSize}px)`,
      transition: !sliding ? "transform ease-in-out 0.5s" : undefined
    };
  }

  getKeyButtonStyle({ isRoot, sliding, pressed }) {
    return {
      flexShrink: 0,
      height: 80,
      width: buttonWidth,
      margin: buttonMargin,
      borderRadius: 4,
      backgroundColor: isRoot ? ColorStore.red : ColorStore.blue,
      opacity: pressed ? 1 : 0.2,
      cursor: !sliding && "pointer"
    };
  }

  getPlayableNotes() {
    return this.props.scaleStore.notes.reduce(
      (acc, on, note) => {
        if (on) {
          acc.push(note);
        }
        return acc;
      },
      []
    );
  }

  onSnap = offset => {
    if (offset.x === null) {
      return offset;
    }
    const {
      notesPerOctave,
      rootOffsetIndex,
      totalNotes
    } = this.deriveOffsetStuff();
    if (notesPerOctave === 0) {
      return { y: offset.y, x: 0 };
    }
    const inversionOffset = Math.round(offset.x / buttonSize);
    this.keyboardStore.offset = inversionOffset;
    const min = width - (totalNotes - rootOffsetIndex) * buttonSize;
    const max = rootOffsetIndex * buttonSize;
    const snap = inversionOffset * buttonSize;
    return { y: offset.y, x: Math.max(min, Math.min(max, snap)) };
  };

  viewButtons({ sliding }) {
    const {
      scaleOffset,
      playableNotes,
      notesPerOctave,
      rootOctave,
      nthNoteInScale,
      rootOffsetIndex,
      semitones
    } = this.deriveOffsetStuff();

    const pressedNotes = SynthStore.pressed;
    return repeat(playableNotes, 8).map((note, index) => {
      const isRoot = modPos(note, semitones) === modPos(scaleOffset, semitones);

      const octave = Math.floor(index / notesPerOctave);
      const offsetNote = note + octave * semitones;
      const slide = rootOctave * notesPerOctave +
        nthNoteInScale -
        this.keyboardStore.offset;
      const pressed = pressedNotes[offsetNote];
      return (
        <Playable
          scaleStore={this.props.scaleStore}
          key={offsetNote}
          nth={index - slide}
          note={offsetNote}
          render={({ onMouseDown, onMouseUp, onMouseLeave }) => (
            <div
              className="button"
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              style={this.getKeyButtonStyle({ isRoot, sliding, pressed })}
            />
          )}
        />
      );
    });
  }

  view({ scaleStore }) {
    return (
      <Slidable
        onSnap={this.onSnap}
        filterTarget={target => target.className !== "button"}
        render={(
          {
            onMouseDown,
            onMouseUp,
            onMouseMove,
            onMouseLeave,
            offset,
            sliding
          }
        ) => (
          <div
            style={this.getKeyboardContainerStyle()}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
          >
            <div style={this.getKeyboardStyle({ sliding, offset })}>
              {this.viewButtons({ sliding })}
            </div>
          </div>
        )}
      />
    );
  }
}
