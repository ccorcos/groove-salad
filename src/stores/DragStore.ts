import { Value } from "reactive-magic"
import { Point } from "../types/Point"
import { DragMouseEvent } from "../types/DragMouseEvent"
import { DragTouchEvent } from "../types/DragTouchEvent"

export default class DragStore {
	down = new Value(false)
	touchId = new Value(null)
	offset = new Value<Point>({ x: null, y: null })
	prev = new Value<Point>({ x: null, y: null })
	current = new Value<Point>({ x: null, y: null })

	handleDown = (p: Point) => {
		this.down.set(true)
		this.prev.set(p)
		this.current.set(p)
	}

	handleMouseDown = (e: DragMouseEvent) => {
		this.handleDown({ x: e.pageX, y: e.pageY })
	}

	handleTouchStart = (e: DragTouchEvent) => {
		const touch = e.changedTouches[0]
		this.touchId.set(touch.identifier)
		this.handleDown({ x: touch.pageX, y: touch.pageY })
	}

	handleMove = (p: Point) => {
		if (this.down.get()) {
			this.prev.set(this.current.get())
			this.current.set(p)
			this.offset.update(({ x, y }) => ({
				x: x + this.current.get().x - this.prev.get().x,
				y: y + this.current.get().y - this.prev.get().y,
			}))
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
		this.handleMove({ x: e.pageX, y: e.pageY })
	}

	handleTouchMove = (e: DragTouchEvent) => {
		const touch = this.currentTouch(e)
		if (touch) {
			this.handleMove({ x: touch.pageX, y: touch.pageY })
		}
	}

	handleUp = (p: Point) => {
		if (this.down.get()) {
			this.down.set(false)
			this.prev.set(p)
			this.current.set(p)
		}
	}

	handleMouseUp = (e: DragMouseEvent) => {
		this.handleUp({ x: null, y: null })
	}

	handleTouchEnd = (e: DragTouchEvent) => {
		const touch = this.currentTouch(e)
		if (touch) {
			this.handleUp({ x: null, y: null })
			this.touchId.set(null)
		}
	}
}
