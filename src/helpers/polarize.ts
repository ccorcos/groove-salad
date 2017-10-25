import { Point } from "../types/Point"
import { PolarPoint } from "../types/PolarPoint"

// Find the polar coordinates of the point within the rect
export default function polarize(point: Point, rect: ClientRect): PolarPoint {
	const p = {
		x: point.x - rect.left - rect.width / 2,
		y: point.y - rect.top - rect.height / 2,
	}
	const r = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2))
	const a = Math.atan2(p.y, p.x)
	return { r, a }
}
