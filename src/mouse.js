import { Store } from "reactive-magic";

const MouseStore = Store({ x: 0, y: 0 });

document.addEventListener("mousemove", function(event) {
  MouseStore.x = event.clientX;
  MouseStore.y = event.clientY;
});

export default MouseStore;
