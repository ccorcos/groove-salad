import React from "react";
import Tone from "tone";
import { Component, Store } from "reactive-magic";

const freeverb = new Tone.Freeverb({
  roomSize: 0.90,
  dampening: 30000
}).toMaster();

var filter = new Tone.Filter({
  type: "lowpass",
  frequency: 250,
  rolloff: -24, // -12, -24, -48 or -96
  Q: 1,
  gain: 0
}).connect(freeverb);

const synth = new Tone.MonoSynth().connect(filter);

const numberToLetter = n => {
  const letter = [
    "C",
    "D#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B"
  ][n % 12];
  const number = Math.floor(n / 12);
  return `${letter}${number}`;
};

const keyboard = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];

export default class Playable extends Component {
  // static defaultProps = {
  //   character: "A",
  //   note: 60,
  //   element: <div/>
  // };

  willMount() {
    this.startKeyboardListener();
  }

  willUnmount() {
    this.stopKeyboardListener();
  }

  startKeyboardListener = () => {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  };

  stopKeyboardListener = () => {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  };

  getCharacter() {
    if (this.props.character) {
      return this.props.character;
    }
    if (this.props.nth !== undefined) {
      return keyboard[this.props.nth];
    }
    return;
  }

  handleKeyDown = e => {
    const char = this.getCharacter();
    if (char) {
      if (e.code === `Key${char.toUpperCase()}`) {
        this.handleMouseDown();
      }
    }
  };

  handleKeyUp = e => {
    const char = this.getCharacter();
    if (char) {
      if (e.code === `Key${char.toUpperCase()}`) {
        this.handleMouseUp();
      }
    }
  };

  propagateEvent(name, ...args) {
    const propagate = this.props[name];
    if (propagate) {
      propagate(...args);
    }
  }

  handleMouseDown = e => {
    this.propagateEvent("onMouseDown", e);
    synth.triggerAttack(numberToLetter(this.props.note));
  };

  handleMouseUp = e => {
    this.propagateEvent("onMouseUp", e);
    synth.triggerRelease();
  };

  view(
    {
      character,
      nth,
      render,
      note,
      ...props
    }
  ) {
    const element = this.props.render();
    return React.cloneElement(element, {
      ...props,
      onMouseDown: this.handleMouseDown,
      onMouseUp: this.handleMouseUp
    });
  }
}
