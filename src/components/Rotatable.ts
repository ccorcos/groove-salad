import * as React from "react";
import { Value } from "reactive-magic";
import Component from "reactive-magic/component"
import { modMinus } from "../utils/mod-math";
import { Point, polarize } from "../utils/coords"

export type RotateMouseEvent = React.MouseEvent<Element> | MouseEvent

export class RotateStore {
  down = new Value(false)
  offset = new Value(0)
  prev = new Value({ x: null, y: null })
  current = new Value({ x: null, y: null })

  handleMouseDown = (e: RotateMouseEvent) => {
    this.down.set(true);
    this.prev.set({x: e.pageX, y: e.pageY});
    this.current.set({x: e.pageX, y: e.pageY});
  }

  handleMouseMove = (rect: ClientRect, e: RotateMouseEvent) => {
    if (this.down.get()) {
      this.prev.set(this.current.get());
      this.current.set({x: e.pageX, y: e.pageY});

      // get the rect and offset by an angle
      const p1 = polarize(this.prev.get(), rect);
      const p2 = polarize(this.current.get(), rect);
      const da = modMinus(p2.a, p1.a, 2 * Math.PI);
      this.offset.update(offset => offset + da);
    }
  }

  handleMouseUp = (e: RotateMouseEvent) => {
    if (this.down.get()) {
      this.down.set(false);
      this.prev.set({ x: null, y: null });
      this.current.set({ x: null, y: null });
    }
  };
}

export interface RenderProps {
  onMouseDown: (e: RotateMouseEvent) => void
  rotation: number
  rotating: boolean
}

export interface Props {
  render: (p: RenderProps) => JSX.Element
  onChange?: (n: number) => void
  onSnap?: (n: number) => number
  filterTarget?: (t: EventTarget) => boolean
  rotateStore?: RotateStore
}

export default class Rotatable extends Component<Props> {
  rect: ClientRect
  rotateStore: RotateStore

  constructor(props: Props) {
    super(props)
    this.rotateStore = props.rotateStore || new RotateStore()
  }

  startWindowListeners() {
    window.addEventListener("mousemove", this.handleMouseMove)
    window.addEventListener("mouseup", this.handleMouseUp)
  }

  stopWindowListeners() {
    window.removeEventListener("mousemove", this.handleMouseMove)
    window.removeEventListener("mouseup", this.handleMouseUp)
  }

  willUnmount() {
    this.stopWindowListeners()
  }

  handleMouseDown = (e: RotateMouseEvent) => {
    if (this.props.filterTarget) {
      if (!this.props.filterTarget(e.target)) {
        return;
      }
    }
    this.rect = (e.currentTarget as Element).getBoundingClientRect()
    this.rotateStore.handleMouseDown(e)
    this.startWindowListeners()
  };

  handleMouseMove = (e: MouseEvent) => {
    this.rotateStore.handleMouseMove(this.rect, e);
    if (this.rotateStore.down.get()) {
      if (this.props.onChange) {
        this.props.onChange(this.rotateStore.offset.get())
      }
    }
  };

  handleMouseUp = (e: MouseEvent) => {
    if (this.rotateStore.down.get()) {
      this.rotateStore.handleMouseUp(e)
      if (this.props.onSnap) {
        this.rotateStore.offset.update(this.props.onSnap);
      }
    }
    this.stopWindowListeners()
  };

  view({ render }: Props) {
    return render({
      onMouseDown: this.handleMouseDown,
      rotation: this.rotateStore.offset.get(),
      rotating: this.rotateStore.down.get()
    });
  }
}
