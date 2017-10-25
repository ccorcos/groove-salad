import scaleIndex from "./scaleIndex"
import scales from "./scales"

export default function getCurrentScale() {
	return scales[scaleIndex.get()]
}
