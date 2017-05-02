import { Value, DerivedValue } from "reactive-magic";

export default class ScaleStore {
  semitones = new Value(12)
  octaves = new Value(8)
  offset = new Value(0)
  base = new DerivedValue(() => {
    return this.semitones.get() * this.octaves.get() / 2
  })
  notes = new Value(Array(12).fill(false) as Array<boolean>)
  baseFreq = new Value(440)
}
