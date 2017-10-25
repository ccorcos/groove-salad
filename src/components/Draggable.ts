import Component from "reactive-magic/component"
import { Point } from "../types/Point"
import { DragMouseEvent } from "../types/DragMouseEvent"
import { DragTouchEvent } from "../types/DragTouchEvent"
import DragStore from "../stores/DragStore"

interface RenderProps {
	onMouseDown: (e: DragMouseEvent) => void
	onTouchStart: (e: DragTouchEvent) => void
	offset: Point
	dragging: boolean
}

interface Props {
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
				return
			}
		}
		this.dragStore.handleMouseDown(e)
		this.startWindowListeners()
	}

	handleTouchStart = (e: DragTouchEvent) => {
		if (this.props.filterTarget) {
			if (!this.props.filterTarget(e.target)) {
				return
			}
		}
		this.dragStore.handleTouchStart(e)
		this.startWindowListeners()
	}

	handleMouseMove = (e: MouseEvent) => {
		if (this.dragStore.down.get()) {
			this.dragStore.handleMouseMove(e)
			if (this.props.onChange) {
				this.props.onChange(this.dragStore.offset.get())
			}
		}
	}

	handleTouchMove = (e: TouchEvent) => {
		if (this.dragStore.down.get()) {
			this.dragStore.handleTouchMove(e)
			if (this.props.onChange) {
				this.props.onChange(this.dragStore.offset.get())
			}
		}
	}

	handleMouseUp = (e: MouseEvent) => {
		if (this.dragStore.down.get()) {
			this.dragStore.handleMouseUp(e)
			if (this.props.onSnap) {
				this.dragStore.offset.update(this.props.onSnap)
			}
		}
		this.stopWindowListeners()
	}

	handleTouchEnd = (e: TouchEvent) => {
		if (this.dragStore.down.get()) {
			this.dragStore.handleTouchEnd(e)
			if (this.props.onSnap) {
				this.dragStore.offset.update(this.props.onSnap)
			}
		}
		this.stopWindowListeners()
	}

	view({ render }: Props) {
		return render({
			onMouseDown: this.handleMouseDown,
			onTouchStart: this.handleTouchStart,
			offset: this.dragStore.offset.get(),
			dragging: this.dragStore.down.get(),
		})
	}
}
