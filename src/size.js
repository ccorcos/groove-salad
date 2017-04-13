import { Store } from "reactive-magic";

const SizeStore = Store({
  height: window.innerHeight,
  width: window.innerWidth
});

window.onresize = function() {
  SizeStore.height = window.innerHeight;
  SizeStore.width = window.innerWidth;
};

export default SizeStore;
