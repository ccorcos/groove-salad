import { Value } from "reactive-magic";

type pressedType = {[key: number]: true}

export class SynthStore {
  pressed = new Value<pressedType>({})
}

const synthStore = new SynthStore()

export default synthStore;
