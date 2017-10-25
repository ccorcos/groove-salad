import { Value, DerivedValue } from "reactive-magic";
import ScaleStore from "./Scale"

export class AppStore {

  selectScale(i) {
    this.scaleIndex.set(i)
  }

  getCurrentScale() {
    return this.scales[this.scaleIndex.get()]
  }

  scales = [
    new ScaleStore(),
    new ScaleStore(),
    new ScaleStore(),
    new ScaleStore(),
  ]

  scaleIndex = new Value(0)


}

window.addEventListener("keypress", handleKeyPress);

function handleKeyPress(e: KeyboardEvent) {
  const n = parseInt(e.code.replace("Digit", ""))
  if (n >= 1 && n <= 4) {
    appStore.selectScale(n - 1)
  }
}

const appStore = new AppStore()

export default appStore
