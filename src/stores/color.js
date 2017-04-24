import { Store } from "reactive-magic";

const ColorStore = Store({
  yellow: "#E3C235",
  red: "#CB4D3E",
  green: "#7BB872",
  blue: "#6395D0",
  gray: "rgb(51, 51, 51)",
  black: "#000000",
  lightgray: "#6F6F6F"
});

export function hexToRgba(hex, opacity) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
}

export default ColorStore;
