import React from "react";
import Tone from "tone";
import { Component, Store } from "reactive-magic";

const synth = new Tone.AMSynth().toMaster();
// const SynthStore = Store({ synth: new Tone.AMSynth().toMaster() });

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
    console.log("unmount playable");
  }

  startKeyboardListener = () => {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  };

  stopKeyboardListener = () => {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  };

  handleKeyDown = e => {
    if (this.props.character) {
      if (e.code === `Key${this.props.character.toUpperCase()}`) {
        this.handleMouseDown();
      }
    }
  };

  handleKeyUp = e => {
    if (this.props.character) {
      if (e.code === `Key${this.props.character.toUpperCase()}`) {
        this.handleMouseUp();
      }
    }
  };

  handleMouseDown = () => {
    synth.triggerAttack(numberToLetter(this.props.note));
  };

  handleMouseUp = () => {
    synth.triggerRelease();
  };

  render() {
    return React.cloneElement(this.props.element, {
      onMouseDown: this.handleMouseDown,
      onMouseUp: this.handleMouseUp
    });
  }
}
