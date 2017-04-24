import React from "react";
import Tone from "tone";
import { Component, Store } from "reactive-magic";
import SynthStore from "./stores/synth";

const freeverb = new Tone.Freeverb({
  roomSize: 0.50,
  dampening: 30000
}).toMaster();

var filter = new Tone.Filter({
  type: "lowpass",
  frequency: 250,
  rolloff: -12, // -12, -24, -48 or -96
  Q: 1,
  gain: 0
}).connect(freeverb);

var synth = new Tone.PolySynth({
  polyphony: 4,
  // volume:0,
  // detune:0,
  voice: Tone.MonoSynth
}).connect(filter);

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

  playableStore = Store({
    down: false
  });

  willMount() {
    this.startKeyboardListener();
  }

  willUnmount() {
    this.stopKeyboardListener();
    this.triggerRelease();
  }

  willUpdate(props) {
    if (this.props.note !== props.note) {
      this.triggerRelease();
    }
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
    if (this.playableStore.down) {
      return;
    }
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

  getFrequency() {
    const base = this.props.scaleStore.base;
    const baseFreq = this.props.scaleStore.baseFreq;
    return baseFreq * Math.pow(2, (this.props.note - base) / 12);
  }

  triggerAttack() {
    this.playableStore.down = true;
    SynthStore.pressed[this.props.note] = true;
    SynthStore.pressed = SynthStore.pressed;
    synth.triggerAttack(this.getFrequency());
  }

  triggerRelease() {
    this.playableStore.down = false;
    delete SynthStore.pressed[this.props.note];
    SynthStore.pressed = SynthStore.pressed;
    synth.triggerRelease(this.getFrequency());
  }

  handleMouseDown = e => {
    this.propagateEvent("onMouseDown", e);
    this.triggerAttack();
  };

  handleMouseLeave = e => {
    this.handleMouseUp();
  };

  handleMouseUp = e => {
    this.propagateEvent("onMouseUp", e);
    this.triggerRelease();
  };

  view({ render }) {
    return render({
      onMouseDown: this.handleMouseDown,
      onMouseUp: this.handleMouseUp,
      onMouseLeave: this.handleMouseLeave
    });
  }
}
