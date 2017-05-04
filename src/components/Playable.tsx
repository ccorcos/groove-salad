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

// window.addEventListener("mousemove", e => {
//   freeverb.set("roomSize", e.pageX / window.innerWidth)
// })

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

export type PlayMouseEvent = React.MouseEvent<Element> | MouseEvent
export type PlayTouchEvent = React.TouchEvent<Element> | TouchEvent

interface RenderProps {
  onMouseDown(e: PlayMouseEvent): void
  onTouchStart(e: PlayTouchEvent): void
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
  touchId = new Value(null)

  willMount() {
    this.startKeyboardListener();
  }

  willUnmount() {
    this.stopKeyboardListener();
    this.stopMouseListener();
    this.triggerRelease();
  }

  willUpdate(props) {
    if (this.down.get()) {
      if (this.props.note !== props.note || this.props.nth !== props.nth) {
        this.triggerRelease();
        this.touchId.set(null)
      }
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

  startMouseListener = () => {
    window.addEventListener("mouseup", this.handleMouseUp);
    window.addEventListener("touchend", this.handleTouchEnd);
  };

  stopMouseListener = () => {
    window.removeEventListener("mouseup", this.handleMouseUp);
    window.removeEventListener("touchend", this.handleTouchEnd);
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
    const base = this.props.scaleStore.baseSemitone.get();
    const baseFreq = this.props.scaleStore.baseSemitoneFreq.get();
    const semitones = this.props.scaleStore.semitonesPerOctave.get();
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
    this.startMouseListener()
  };

  currentTouch = (e: PlayTouchEvent) => {
    const touches = e.changedTouches
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i]
      if (touch.identifier === this.touchId.get()) {
        return touch
      }
    }
  }

  handleTouchStart = (e: PlayTouchEvent) => {
    const touch = e.changedTouches[0]
    this.touchId.set(touch.identifier)
    this.triggerAttack();
    this.startMouseListener()
  };

  handleMouseUp = (e?: any) => {
    this.triggerRelease();
    this.stopMouseListener()
  };

  handleTouchEnd = (e: TouchEvent) => {
    const touch = this.currentTouch(e)
    if (touch) {
      this.touchId.set(null)
      this.triggerRelease()
      this.stopMouseListener()
    }
  };

  view({ render }) {
    return render({
      onMouseDown: this.handleMouseDown,
      onTouchStart: this.handleTouchStart,
    });
  }
}
