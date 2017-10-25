import Component from "reactive-magic/component"
import { DragMouseEvent } from "./DragMouseEvent"
import { DragTouchEvent } from "./DragTouchEvent"
import RotateStore from "./RotateStore"

interface RenderProps {
	onMouseDown: (e: DragMouseEvent) => void
	onTouchStart: (e: DragTouchEvent) => void
	rotation: number
	rotating: boolean
}

interface Props {
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

	handleMouseDown = (e: DragMouseEvent) => {
		if (this.props.filterTarget) {
			if (!this.props.filterTarget(e.target)) {
				return
			}
		}
		this.rect = (e.currentTarget as Element).getBoundingClientRect()
		this.rotateStore.handleMouseDown(e)
		this.startWindowListeners()
	}

	handleTouchStart = (e: DragTouchEvent) => {
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
