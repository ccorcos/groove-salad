// modMinus find the difference between any two numbers in a set, returning values withing [-base/2, base/2].
//
// This is useful for computing the smallest rotation to get between two numbers, not accounting for full rotations.
//
//    modMinus(1, 0, 12) => 1
//    modMinus(1, 12, 12) => 1
//    modMinus(1, 2, 12) => -1
//    modMinus(1, 14, 12) => -1
//    modMinus(1, -14, 12) => 3
//
export default function modMinus(x: number, y: number, base: number): number {
	let distance = x - y
	while (distance > base / 2) {
		distance -= base
	}
	while (distance < -(base / 2)) {
		distance += base
	}
	return distance
}
