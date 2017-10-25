// modPos is like the mod operator except x is interpereted as a rotation in the set and always returns a positive number.
//
// It's useful for dealing with notes:
//
//    modPos(1, 12) => 1
//    modPos(13, 12) => 1
//    modPos(-1, 12) => 11
//    modPos(-11, 12) => 1
//    modPos(1, 12) => 1
//
// And its also useful for angles
//
//    modPos(90, 360) => 90
//    modPos(450, 360) => 90
//    modPos(-90, 360) => 270
//    modPos(-450, 360) => 270
//
export default function modPos(x: number, base: number): number {
	let y = x % base
	while (y < 0) {
		y += base
	}
	return y
}
