import { Value, DerivedValue } from "reactive-magic"
import { modPos } from "./mod-math"

function emptyNotes(n: number): Array<boolean> {
	return Array(n).fill(false)
}

export default class ScaleStore {
	semitonesPerOctave = new Value(12)
	notes = new Value(emptyNotes(12))
	octaves = new Value(8)

	baseSemitone = new DerivedValue(() => {
		return this.semitonesPerOctave.get() * this.octaves.get() / 2
	})
	semitoneOffset = new Value(0)
	rootSemitone = new DerivedValue(() => {
		return this.baseSemitone.get() + this.semitoneOffset.get()
	})
	baseSemitoneFreq = new Value(440)

	// A note is number in [0-semitonesPerOctave]
	playableNotes = new DerivedValue(() => {
		return this.notes.get().reduce((acc, on, note) => {
			if (on) {
				acc.push(note)
			}
			return acc
		}, []) as Array<number>
	})

	notesPerOctave = new DerivedValue(() => {
		return this.playableNotes.get().length
	})

	totalNotes = new DerivedValue(() => {
		return this.notesPerOctave.get() * this.octaves.get()
	})

	// offset in playableNotes
	rootNoteOffset = new DerivedValue(() => {
		return this.playableNotes
			.get()
			.indexOf(modPos(this.rootSemitone.get(), this.semitonesPerOctave.get()))
	})

	rootOctave = new DerivedValue(() => {
		return Math.floor(this.rootSemitone.get() / this.semitonesPerOctave.get())
	})

	// index in totalNotes
	rootNoteIndex = new DerivedValue(() => {
		return (
			this.rootOctave.get() * this.notesPerOctave.get() +
			this.rootNoteOffset.get()
		)
	})

	changeSemitonesPerOctave = (n: number) => {
		this.semitonesPerOctave.set(n)
		this.semitoneOffset.set(0)
		this.notes.set(emptyNotes(n))
	}
}
