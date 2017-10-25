import { Value } from "reactive-magic"

type pressedType = { [key: number]: true }

const pressedNotes = new Value<pressedType>({})
export default pressedNotes
