import { modPos, modMinus } from "./utils/mod-math";

const arc = 2 * Math.PI / 12;
export function rotateScale(scaleStore, angle) {
  let distance = 99;
  let closest = scaleStore.offset;
  // console.log(angle, scaleStore.offset * 2 * Math.PI / 12);
  scaleStore.notes.forEach((on, i) => {
    if (on) {
      const d = Math.abs(modMinus(i * arc, angle, Math.PI * 2));
      if (d < distance) {
        distance = d;
        closest = i;
      }
    }
  });

  console.log(
    angle,
    scaleStore.offset,
    closest,
    modMinusUp(scaleStore.offset, closest, 12),
    modMinusDown(scaleStore.offset, closest, 12),
    modMinus(scaleStore.offset, closest, 12)
  );
  if (angle > 0) {
    scaleStore.offset += modMinusDown(scaleStore.offset, closest, 12);
  } else if (angle < 0) {
    scaleStore.offset += modMinusUp(scaleStore.offset, closest, 12);
  } else {
    scaleStore.offset += modMinus(scaleStore.offset, closest, 12);
  }
}

// we need find out the closest note we can spin to and set the offset. could be up 2pi or down 2pi potentially

// export function rotateScale(scaleStore, angle) {
//   // 2 * Math.PI / 12
//   // scaleStore.notes
//   // scaleStore.offset
//   // angle
//   // angle % 2 * Math.PI / 12
//
//   if (angle > 0) {
//       angle - note
//
//     // scaleStore.offset +=
//   } else {
//
//     // scaleStore.offset -=
//   }
// }
