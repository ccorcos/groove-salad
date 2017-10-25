import selectScale from "./selectScale"

export default function handleKeyPress(e: KeyboardEvent) {
	const n = parseInt(e.code.replace("Digit", ""))
	if (n >= 1 && n <= 4) {
		selectScale(n - 1)
	}
}
