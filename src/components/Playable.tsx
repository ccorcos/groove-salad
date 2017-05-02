import * as React from "react";
import Tone from "tone";
import { Value } from "reactive-magic";
import Component from "reactive-magic/component"
import synthStore from "../stores/Synth";
import ScaleStore from "../stores/Scale"

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

export type PlayEvent = React.MouseEvent<Element> | MouseEvent

interface RenderProps {
  onMouseDown(e: PlayEvent): void
  onMouseUp(e: PlayEvent): void
  onMouseLeave(e: PlayEvent): void
}

interface PlayableProps {
  character?: string
  note?: number
  nth?: number
  scaleStore: ScaleStore
  render(p: RenderProps): JSX.Element
}

export default class Playable extends Component<PlayableProps> {

  down = new Value(false)

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

  handleKeyDown = (e: KeyboardEvent) => {
    if (this.down.get()) {
      return;
    }
    const char = this.getCharacter();
    if (char) {
      if (e.code === `Key${char.toUpperCase()}`) {
        this.handleMouseDown(e);
      }
    }
  };

  handleKeyUp = (e: KeyboardEvent) => {
    const char = this.getCharacter();
    if (char) {
      if (e.code === `Key${char.toUpperCase()}`) {
        this.handleMouseUp(e);
      }
    }
  };

  getFrequency() {
    const base = this.props.scaleStore.base.get();
    const baseFreq = this.props.scaleStore.baseFreq.get();
    const semitones = this.props.scaleStore.semitones.get();
    return baseFreq * Math.pow(2, (this.props.note - base) / semitones);
  }

  triggerAttack() {
    this.down.set(true);
    synthStore.pressed.update(pressed => {
      pressed[this.props.note] = true;
      return pressed
    })
    synth.triggerAttack(this.getFrequency());
  }

  triggerRelease() {
    this.down.set(false);
    synthStore.pressed.update(pressed => {
      delete pressed[this.props.note];
      return pressed
    })
    synth.triggerRelease(this.getFrequency());
  }

  handleMouseDown = (e?: any) => {
    this.triggerAttack();
  };

  handleMouseLeave = (e?: any) => {
    this.handleMouseUp();
  };

  handleMouseUp = (e?: any) => {
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
