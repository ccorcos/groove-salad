import { Value, DerivedValue } from "reactive-magic";

export class SizeStore {
  // iPad
  // pieDiameter = new Value(350);
  // keyboardHeight = new Value(300);
  // keyboardButtonHeight = new Value(120)
  // keyboardButtonWidth = new Value(72)
  // keyboardButtonMargin = new Value(12)
  // keyboardViewableButtons = new Value(6)

  // iPhone 7
  pieDiameter = new Value(200);
  keyboardHeight = new Value(250);
  keyboardButtonHeight = new Value(96)
  keyboardButtonWidth = new Value(64)
  keyboardButtonMargin = new Value(8)
  keyboardViewableButtons = new Value(6)

  keyboardButtonSize = new DerivedValue(() =>
    this.keyboardButtonWidth.get() + 2 * this.keyboardButtonMargin.get()
  )
  keyboardWidth = new DerivedValue(() =>
    this.keyboardButtonSize.get() * 6
  )
}

const sizeStore = new SizeStore();

export default sizeStore;
