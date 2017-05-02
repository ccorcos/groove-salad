import * as React from "react";
import { Value } from "reactive-magic"
import Component from "reactive-magic/component"
import { Point } from "../utils/coords"

export type DragMouseEvent = React.MouseEvent<Element> | MouseEvent

export class DragStore {
  down = new Value(false)
  offset = new Value<Point>({ x: null, y: null })
  prev = new Value<Point>({ x: null, y: null })
  current = new Value<Point>({ x: null, y: null })

  handleMouseDown(e: DragMouseEvent) {
    this.down.set(true);
    this.prev.set({x: e.pageX, y: e.pageY});
    this.current.set({x: e.pageX, y: e.pageY});
  }

  handleMouseMove(e: DragMouseEvent) {
    if (this.down.get()) {
      this.prev.set(this.current.get());
      this.current.set({x: e.pageX, y: e.pageY});
      this.offset.update(({x, y}) => ({
        x: x + this.current.get().x - this.prev.get().x,
        y: y + this.current.get().y - this.prev.get().y
      }));
    }
  }

  handleMouseUp(e: DragMouseEvent) {
    if (this.down.get()) {
      this.down.set(false);
      this.prev.set({ x: null, y: null });
      this.current.set({ x: null, y: null });
    }
  };
}

export interface RenderProps {
  onMouseDown: (e: DragMouseEvent) => void
  offset: Point
  dragging: boolean
}

export interface Props {
  render: (p: RenderProps) => JSX.Element
  onChange?: (n: Point) => void
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
  }

  stopWindowListeners() {
    window.removeEventListener("mousemove", this.handleMouseMove)
    window.removeEventListener("mouseup", this.handleMouseUp)
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

  handleMouseMove = (e: MouseEvent) => {
    if (this.dragStore.down.get()) {
      this.dragStore.handleMouseMove(e)
      if (this.props.onChange) {
        this.props.onChange(this.dragStore.offset.get())
      }
    }
  };

  handleMouseUp = (e: MouseEvent) => {
    if (this.dragStore.down.get()) {
      this.dragStore.handleMouseUp(e);
      if (this.props.onSnap) {
        this.dragStore.offset.update(this.props.onSnap)
      }
    }
    this.stopWindowListeners()
  };

  view({render}: Props) {
    return render({
      onMouseDown: this.handleMouseDown,
      offset: this.dragStore.offset.get(),
      dragging: this.dragStore.down.get()
    });
  }
}
