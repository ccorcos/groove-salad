import * as React from "react"
import { Value } from "reactive-magic"
import Component from "reactive-magic/component"
import { modMinus } from "./mod-math"
import { Point, polarize } from "./coords"

export type RotateMouseEvent = React.MouseEvent<Element> | MouseEvent
export type RotateTouchEvent = React.TouchEvent<Element> | TouchEvent

export class RotateStore {
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

	handleMouseDown = (e: RotateMouseEvent) => {
		this.handleDown({ x: e.pageX, y: e.pageY })
	}

	handleTouchStart = (e: RotateTouchEvent) => {
		const touch = e.changedTouches[0]
		this.touchId.set(touch.identifier)
		this.handleDown({ x: touch.pageX, y: touch.pageY })
	}

	currentTouch = (e: RotateTouchEvent) => {
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

	handleMouseMove = (rect: ClientRect, e: RotateMouseEvent) => {
		this.handleMove(rect, { x: e.pageX, y: e.pageY })
	}

	handleTouchMove = (rect: ClientRect, e: RotateTouchEvent) => {
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

	handleMouseUp = (e: RotateMouseEvent) => {
		this.handleUp({ x: null, y: null })
	}

	handleTouchEnd = (e: RotateTouchEvent) => {
		const touch = this.currentTouch(e)
		if (touch) {
			this.handleUp({ x: null, y: null })
			this.touchId.set(null)
		}
	}
}

export interface RenderProps {
	onMouseDown: (e: RotateMouseEvent) => void
	onTouchStart: (e: RotateTouchEvent) => void
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

	handleMouseDown = (e: RotateMouseEvent) => {
		if (this.props.filterTarget) {
			if (!this.props.filterTarget(e.target)) {
				return
			}
		}
		this.rect = (e.currentTarget as Element).getBoundingClientRect()
		this.rotateStore.handleMouseDown(e)
		this.startWindowListeners()
	}

	handleTouchStart = (e: RotateTouchEvent) => {
		if (this.props.filterTarget) {
			if (!this.props.filterTarget(e.target)) {
				return
			}
		}
		this.rect = (e.currentTarget as Element).getBoundingClientRect()
		this.rotateStore.handleTouchStart(e)
		this.startWindowListeners()
	}

	handleMouseMove = (e: MouseEvent) => {
		this.rotateStore.handleMouseMove(this.rect, e)
		if (this.rotateStore.down.get()) {
			if (this.props.onChange) {
				this.props.onChange(this.rotateStore.offset.get())
			}
		}
	}

	handleTouchMove = (e: TouchEvent) => {
		this.rotateStore.handleTouchMove(this.rect, e)
		if (this.rotateStore.down.get()) {
			if (this.props.onChange) {
				this.props.onChange(this.rotateStore.offset.get())
			}
		}
	}

	handleMouseUp = (e: MouseEvent) => {
		if (this.rotateStore.down.get()) {
			this.rotateStore.handleMouseUp(e)
			if (this.props.onSnap) {
				this.rotateStore.offset.update(this.props.onSnap)
			}
		}
		this.stopWindowListeners()
	}

	handleTouchEnd = (e: TouchEvent) => {
		if (this.rotateStore.down.get()) {
			this.rotateStore.handleTouchEnd(e)
			if (this.props.onSnap) {
				this.rotateStore.offset.update(this.props.onSnap)
			}
		}
		this.stopWindowListeners()
	}

	view({ render }: Props) {
		return render({
			onTouchStart: this.handleTouchStart,
			onMouseDown: this.handleMouseDown,
			rotation: this.rotateStore.offset.get(),
			rotating: this.rotateStore.down.get(),
		})
	}
}
