import { Value, DerivedValue } from "reactive-magic";
import ScaleStore from "./Scale"

export class AppStore {
  scales = [
    new ScaleStore(),
    new ScaleStore(),
    new ScaleStore(),
    new ScaleStore(),
  ]

  scaleIndex = new Value(0)

  getCurrentScale() {
    return this.scales[this.scaleIndex.get()]
  }
}

const appStore = new AppStore()

export default appStore
