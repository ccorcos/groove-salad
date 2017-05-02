import { Value } from "reactive-magic";

export class ColorStore {
  static yellow = "#E3C235";
  static red = "#CB4D3E";
  static green = "#7BB872";
  static blue = "#6395D0";
  static gray = "rgb(51, 51, 51)";
  static black = "#000000";
  static lightgray = "#6F6F6F";
  static white = "#FFFFFF";

  primary = new Value(ColorStore.blue);
  accent = new Value(ColorStore.red);
  secondary = new Value(ColorStore.green);
  background = new Value(ColorStore.white);
}

const colorStore = new ColorStore();

export function hexToRgba(hex, opacity) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
}

export default colorStore;
