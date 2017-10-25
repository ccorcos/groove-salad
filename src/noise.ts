import Tone from "tone"

const freeverb = new Tone.Freeverb({
	roomSize: 0.5,
	dampening: 30000,
}).toMaster()

// window.addEventListener("mousemove", e => {
//   freeverb.set("roomSize", e.pageX / window.innerWidth)
// })

var filter = new Tone.Filter({
	type: "lowpass",
	frequency: 250,
	rolloff: -12, // -12, -24, -48 or -96
	Q: 1,
	gain: 0,
}).connect(freeverb)

var synth = new Tone.PolySynth({
	polyphony: 4,
	// volume:0,
	// detune:0,
	voice: Tone.MonoSynth,
}).connect(filter)

export default synth
