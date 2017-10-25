import { Value } from "reactive-magic"
import modMinus from "./modMinus"
import { Point } from "./Point"
import polarize from "./polarize"
import { DragMouseEvent } from "./DragMouseEvent"
import { DragTouchEvent } from "./DragTouchEvent"

export default class RotateStore {
	down = new Value(false)
	touchId = new Value(null)
	offset = new Value(0)
	prev = new Value({ x: null, y: null })
	current = new Value({ x: null, y: null })

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

	currentTouch = (e: DragTouchEvent) => {
		const touches = e.changedTouches
		for (let i = 0; i < touches.length; i++) {
			const touch = touches[i]
			if (touch.identifier === this.touchId.get()) {
				return touch
			}
		}
	}

	handleMove = (rect: ClientRect, p: Point) => {
		if (this.down.get()) {
			this.prev.set(this.current.get())
			this.current.set(p)

			// get the rect and offset by an angle
			const p1 = polarize(this.prev.get(), rect)
			const p2 = polarize(this.current.get(), rect)
			const da = modMinus(p2.a, p1.a, 2 * Math.PI)
			this.offset.update(offset => offset + da)
		}
	}

	handleMouseMove = (rect: ClientRect, e: DragMouseEvent) => {
		this.handleMove(rect, { x: e.pageX, y: e.pageY })
	}

	handleTouchMove = (rect: ClientRect, e: DragTouchEvent) => {
		const touch = this.currentTouch(e)
		if (touch) {
			this.handleMove(rect, { x: touch.pageX, y: touch.pageY })
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
