import * as React from "react";
import { Value } from "reactive-magic";
import Component from "reactive-magic/component"
import Playable from "./playable";
import colorStore, { hexToRgba } from "../stores/Color";
import { modPos } from "creative-ux/utils/mod-math";
import Draggable from "creative-ux/components/Draggable";
import synthStore from "../stores/Synth";
import ScaleStore from "../stores/Scale"

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

export interface KeyboardProps {
  scaleStore: ScaleStore
}

export default class Keyboard extends Component<KeyboardProps> {

  // offset of playable notes for making inversions
  noteOffset = new Value(0)

  getKeyboardContainerStyle(): React.CSSProperties {
    return {
      display: "flex",
      margin: 8,
      overflow: "hidden",
      width: width,
      border: `1px solid black`,
      borderRadius: 4,
      borderColor: hexToRgba(colorStore.primary.get(), 0.2),
      cursor: "ew-resize"
    };
  }

  getKeyboardStyle({ dragging, offset }): React.CSSProperties {
    const rootNoteIndex = this.props.scaleStore.rootNoteIndex.get()
    return {
      height: 200,
      flex: 1,
      display: "flex",
      alignItems: "center",
      transform: `translateX(${offset.x - rootNoteIndex * buttonSize}px)`,
      transition: !dragging ? "transform ease-in-out 0.5s" : undefined
    };
  }

  getKeyButtonStyle({ isRoot, dragging, pressed }): React.CSSProperties {
    const primaryColor = colorStore.primary.get()
    const accentColor = colorStore.accent.get()
    return {
      flexShrink: 0,
      height: 80,
      width: buttonWidth,
      margin: buttonMargin,
      borderRadius: 4,
      backgroundColor: isRoot ? accentColor : primaryColor,
      opacity: pressed ? 1 : 0.2,
      cursor: !dragging && "pointer"
    };
  }

  getPlayableNotes() {
    return this.props.scaleStore.notes.get().reduce(
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
    const notesPerOctave = this.props.scaleStore.notesPerOctave.get()
    const rootNoteIndex = this.props.scaleStore.rootNoteIndex.get()
    const totalNotes = this.props.scaleStore.totalNotes.get()
    if (notesPerOctave === 0) {
      return { y: offset.y, x: 0 };
    }
    const inversionOffset = Math.round(offset.x / buttonSize);
    this.noteOffset.set(inversionOffset);
    const min = width - (totalNotes - rootNoteIndex) * buttonSize;
    const max = rootNoteIndex * buttonSize;
    const snap = inversionOffset * buttonSize;
    return { y: offset.y, x: Math.max(min, Math.min(max, snap)) };
  };

  viewButtons({ dragging }) {
    const notesPerOctave = this.props.scaleStore.notesPerOctave.get()
    const semitonesPerOctave = this.props.scaleStore.semitonesPerOctave.get()
    const semitoneOffset = this.props.scaleStore.semitoneOffset.get()
    const playableNotes = this.props.scaleStore.playableNotes.get()
    const rootOctave = this.props.scaleStore.rootOctave.get()
    const rootNoteOffset = this.props.scaleStore.rootNoteOffset.get()
    const noteOffset = this.noteOffset.get()

    const pressedNotes = synthStore.pressed.get();
    return repeat(playableNotes, 8).map((note, index) => {
      const isRoot = modPos(note, semitonesPerOctave) === modPos(semitoneOffset, semitonesPerOctave);

      const octave = Math.floor(index / notesPerOctave);
      const offsetNote = note + octave * semitonesPerOctave;
      const slide = rootOctave * notesPerOctave + rootNoteOffset - noteOffset
      const pressed = pressedNotes[offsetNote];
      return (
        <Playable
          scaleStore={this.props.scaleStore}
          key={index - slide}
          nth={index - slide}
          note={offsetNote}
          render={({ onMouseDown, onMouseUp, onMouseLeave }) => (
            <div
              className="button"
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              style={this.getKeyButtonStyle({ isRoot, dragging, pressed })}
            />
          )}
        />
      );
    });
  }

  view({ scaleStore }) {
    return (
      <Draggable
        onSnap={this.onSnap}
        filterTarget={target => (target as Element).className !== "button"}
        render={({onMouseDown, offset, dragging}) => (
          <div
            style={this.getKeyboardContainerStyle()}
            onMouseDown={onMouseDown}
          >
            <div style={this.getKeyboardStyle({ dragging, offset })}>
              {this.viewButtons({ dragging })}
            </div>
          </div>
        )}
      />
    );
  }
}
