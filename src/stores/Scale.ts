import { Value, DerivedValue } from "reactive-magic";
import { modPos, modMinus } from "../utils/mod-math"

function emptyNotes(n: number): Array<boolean> {
  return Array(n).fill(false)
}

const TAU = Math.PI * 2

export default class ScaleStore {
  semitonesPerOctave = new Value(12)

  notes = new Value(emptyNotes(12))

  playableNotes = new DerivedValue(() => {
    return this.notes.get().reduce(
      (acc, on, index) => {
        if (on) {
          acc.push(index)
        }
        return acc
      },
      []
    ) as Array<number>
  })

  octaves = new Value(10)

  totalSemitones = new DerivedValue(() =>
    this.semitonesPerOctave.get() * this.octaves.get()
  )

  playableNotesPerOctave = new DerivedValue(() => {
    return this.playableNotes.get().length
  })

  totalPlayableNotes = new DerivedValue(() => {
    return this.playableNotesPerOctave.get() * this.octaves.get()
  })

  octave = new Value(5)

  mode = new Value(0)

  inversion = new Value(0)

  getFrequency(note: number): number {
    // midi note 69 is 440.0000000000
    return 440 * Math.pow(2, (note - 69) / this.semitonesPerOctave.get())
  }

  rootSemitone = new DerivedValue(() => {
      const playableNotes = this.playableNotes.get()
      const mode = this.mode.get()
      const offset = playableNotes.length === 0 ? 0 : playableNotes[mode]
      return this.octave.get() * this.semitonesPerOctave.get() + offset
  })

  rootIndex = new DerivedValue(() => {
    return this.octave.get() * this.playableNotesPerOctave.get() + this.mode.get()
  })

  getPieRotation(): number {
    const playableNotes = this.playableNotes.get()
    const mode = this.mode.get()
    const modeOffset = playableNotes.length === 0 ? 0 : playableNotes[mode] / (playableNotes.length - 1)
    return (modeOffset + this.octave.get()) * TAU
  }

  snapPieRotation(offsetAngle: number): number {
    const prevAngle = this.getPieRotation()
    const totalAngle = prevAngle + offsetAngle
    const playableNotes = this.playableNotes.get()
    const totalNotes = playableNotes.length
    const playableAngles = playableNotes.map(note =>
      note / (totalNotes - 1) * TAU
    )
    const modeDistances = playableAngles.map(angle =>
      modMinus(angle, totalAngle, TAU)
    )
    const closestModeDistance = Math.min(...modeDistances)
    const closestMode = modeDistances.indexOf(closestModeDistance)
    this.mode.set(closestMode)
    const closestOctave = Math.floor((totalAngle + closestModeDistance) / TAU)
    this.octave.set(closestOctave)
    const nextAngle = this.getPieRotation()
    const remainderAngle = totalAngle - nextAngle
    return remainderAngle
  }

  // offset is normalized by button width
  snapKeyboardInversion(offset: number): number {
    const notesPerOctave = this.playableNotesPerOctave.get()
    if (notesPerOctave === 0) {
      return offset
    }
    const inversionOffset = Math.round(offset)
    const inversionTotal = inversionOffset + this.inversion.get()
    const inversionPerOctave = inversionTotal / notesPerOctave
    let remainder = 0
    if (inversionPerOctave >= 1) {
      const octaveDelta = Math.floor(inversionPerOctave)
      this.octave.update(octave => octave + octaveDelta)
      this.inversion.set(inversionTotal - octaveDelta * notesPerOctave)
      remainder = offset - inversionOffset - octaveDelta * notesPerOctave
    } else if (inversionPerOctave <= -1) {
      const octaveDelta = Math.ceil(inversionPerOctave)
      this.octave.update(octave => octave + octaveDelta)
      this.inversion.set(inversionTotal - octaveDelta * notesPerOctave)
      remainder = offset - inversionOffset - octaveDelta * notesPerOctave
    } else {
      this.inversion.set(inversionTotal)
      remainder = offset - inversionOffset
    }

    return remainder
  }

}
