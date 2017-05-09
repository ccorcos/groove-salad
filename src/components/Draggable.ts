import * as React from "react";
import { Value } from "reactive-magic"
import Component from "reactive-magic/component"
import { Point } from "../utils/coords"

export type DragMouseEvent = React.MouseEvent<Element> | MouseEvent
export type DragTouchEvent = React.TouchEvent<Element> | TouchEvent

export class DragStore {
  down = new Value(false)
  touchId = new Value(null)
  offset = new Value<Point>({ x: null, y: null })
  prev = new Value<Point>({ x: null, y: null })
  current = new Value<Point>({ x: null, y: null })

  handleDown = (p: Point) => {
    this.down.set(true);
    this.prev.set(p);
    this.current.set(p);
  }

  handleMouseDown = (e: DragMouseEvent) => {
    this.handleDown({x: e.pageX, y: e.pageY})
  }

  handleTouchStart = (e: DragTouchEvent) => {
    const touch = e.changedTouches[0]
    this.touchId.set(touch.identifier)
    this.handleDown({x: touch.pageX, y: touch.pageY})
  }

  handleMove = (p: Point) => {
    if (this.down.get()) {
      this.prev.set(this.current.get());
      this.current.set(p);
      this.offset.update(({x, y}) => ({
        x: x + this.current.get().x - this.prev.get().x,
        y: y + this.current.get().y - this.prev.get().y
      }));
    }
  }

  currentTouch = (e: DragTouchEvent) => {
    const touches = e.changedTouches
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i]
      if (touch.identifier === this.touchId.get()) {
        return touch
      }
    }
  }

  handleMouseMove = (e: DragMouseEvent) => {
    this.handleMove({x: e.pageX, y: e.pageY})
  }

  handleTouchMove = (e: DragTouchEvent) => {
    const touch = this.currentTouch(e)
    if (touch) {
      this.handleMove({x: touch.pageX, y: touch.pageY})
    }
  }

  handleUp = (p: Point) => {
    if (this.down.get()) {
      this.down.set(false);
      this.prev.set(p);
      this.current.set(p);
    }
  }

  handleMouseUp = (e: DragMouseEvent) => {
    this.handleUp({ x: null, y: null })
  };

  handleTouchEnd = (e: DragTouchEvent) => {
    const touch = this.currentTouch(e)
    if (touch) {
      this.handleUp({ x: null, y: null })
      this.touchId.set(null)
    }
  };
}

export interface RenderProps {
  onMouseDown: (e: DragMouseEvent) => void
  onTouchStart: (e: DragTouchEvent) => void
  offset: Point
  dragging: boolean
}

export interface Props {
  render: (p: RenderProps) => JSX.Element
  onSnap?: (n: Point) => Point
  filterTarget?: (t: EventTarget) => boolean
  dragStore?: DragStore
}

export default class Draggable extends Component<Props> {
  dragStore: DragStore

  constructor(props: Props) {
    super(props)
    this.dragStore = props.dragStore || new DragStore()
  }

  startWindowListeners() {
    window.addEventListener("mousemove", this.handleMouseMove)
    window.addEventListener("mouseup", this.handleMouseUp)
    window.addEventListener("touchmove", this.handleTouchMove)
    window.addEventListener("touchend", this.handleTouchEnd)
  }

  stopWindowListeners() {
    window.removeEventListener("mousemove", this.handleMouseMove)
    window.removeEventListener("mouseup", this.handleMouseUp)
    window.removeEventListener("touchmove", this.handleTouchMove)
    window.removeEventListener("touchend", this.handleTouchEnd)
  }

  willUnmount() {
    this.stopWindowListeners()
  }

  handleMouseDown = (e: DragMouseEvent) => {
    if (this.props.filterTarget) {
      if (!this.props.filterTarget(e.target)) {
        return;
      }
    }
    this.dragStore.handleMouseDown(e)
    this.startWindowListeners()
  };

  handleTouchStart = (e: DragTouchEvent) => {
    if (this.props.filterTarget) {
      if (!this.props.filterTarget(e.target)) {
        return;
      }
    }
    this.dragStore.handleTouchStart(e)
    this.startWindowListeners()
  };

  handleMouseMove = (e: MouseEvent) => {
    if (this.dragStore.down.get()) {
      this.dragStore.handleMouseMove(e)
      if (this.props.onSnap) {
        this.dragStore.offset.update(this.props.onSnap)
      }
    }
  };

  handleTouchMove = (e: TouchEvent) => {
    if (this.dragStore.down.get()) {
      this.dragStore.handleTouchMove(e)
      if (this.props.onSnap) {
        this.dragStore.offset.update(this.props.onSnap)
      }
    }
  };

  handleMouseUp = (e: MouseEvent) => {
    if (this.dragStore.down.get()) {
      this.dragStore.handleMouseUp(e);
      if (this.props.onSnap) {
        this.dragStore.offset.update(this.props.onSnap)
      }
      this.dragStore.offset.set({x: 0, y: 0})
    }
    this.stopWindowListeners()
  };

  handleTouchEnd = (e: TouchEvent) => {
    if (this.dragStore.down.get()) {
      this.dragStore.handleTouchEnd(e);
      if (this.props.onSnap) {
        this.dragStore.offset.update(this.props.onSnap)
      }
      this.dragStore.offset.set({x: 0, y: 0})
    }
    this.stopWindowListeners()
  };

  view({render}: Props) {
    return render({
      onMouseDown: this.handleMouseDown,
      onTouchStart: this.handleTouchStart,
      offset: this.dragStore.offset.get(),
      dragging: this.dragStore.down.get()
    });
  }
}
