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
export const modPos = (x: number, base: number): number => {
  let y = x % base;
  while (y < 0) {
    y += base;
  }
  return y;
};

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
export const modMinus = (x: number, y: number, base: number): number => {
  let distance = x - y;
  while (distance > base / 2) {
    distance -= base;
  }
  while (distance < -(base / 2)) {
    distance += base;
  }
  return distance;
};
