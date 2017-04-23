import React from "react";
import { Component, Store } from "reactive-magic";

// const ParamStore = Store({
//   value: 0,
//   min: 0,
//   max: 12,
//   step: 1
// });

// function difference(p1, p2) {
//   return {
//     x: p1.x - p2.x,
//     y: p1.y - p2.y
//   };
// }

function polarize(point, rect) {
  const p = {
    x: point.x - rect.left - rect.width / 2,
    y: point.y - rect.top - rect.height / 2
  };
  const r = Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2));
  const a = Math.atan2(p.y, p.x);
  return { r, a };
}

export default class Rotatable extends Component {
  rotateStore = Store({
    down: false,
    offset: 0,
    prev: { x: null, y: null },
    current: { x: null, y: null },
    velocity: 0,
    dampening: 0.1
  });

  propagateEvent(name, ...args) {
    const propagate = this.props[name];
    if (propagate) {
      propagate(...args);
    }
  }

  handleMouseDown = e => {
    this.propagateEvent("onMouseDown");
    const rotateStore = this.rotateStore;
    rotateStore.down = true;
    rotateStore.prev.x = e.pageX;
    rotateStore.prev.y = e.pageY;
    rotateStore.current.x = e.pageX;
    rotateStore.current.y = e.pageY;
    rotateStore.velocity = 0;
  };

  handleMouseMove = e => {
    this.propagateEvent("onMouseMove");
    const rotateStore = this.rotateStore;
    if (rotateStore.down) {
      rotateStore.prev.x = rotateStore.current.x;
      rotateStore.prev.y = rotateStore.current.y;
      rotateStore.current.x = e.pageX;
      rotateStore.current.y = e.pageY;
      rotateStore.velocity = 0;

      const rect = e.currentTarget.getBoundingClientRect();
      const p1 = polarize(rotateStore.prev, rect);
      const p2 = polarize(rotateStore.current, rect);
      const da = p2.a - p1.a;
      rotateStore.offset += da;
    }
  };

  handleMouseUp = e => {
    this.propagateEvent("onMouseUp");
    const rotateStore = this.rotateStore;
    if (rotateStore.down) {
      rotateStore.down = false;
      rotateStore.prev.x = null;
      rotateStore.prev.y = null;
      rotateStore.current.x = null;
      rotateStore.current.y = null;
      rotateStore.velocity = 0;
    }
  };

  getStyle() {
    const style = this.props.element.props.style;
    const rotateStore = this.rotateStore;
    const transform = `rotate(${rotateStore.offset}rad)`;
    const transformOrigin = "50% 50%";
    if (style) {
      if (style.transform) {
        return Object.assign({}, style, {
          transformOrigin,
          transform: `${transform} ${style.transform}`
        });
      } else {
        return Object.assign({}, style, {
          transformOrigin,
          transform
        });
      }
    } else {
      return {
        transformOrigin,
        transform
      };
    }
  }

  view() {
    const {
      element,
      ...props
    } = this.props;
    const style = this.getStyle();
    console.log(style.transform);
    return React.cloneElement(this.props.element, {
      ...props,
      onMouseDown: this.handleMouseDown,
      onMouseUp: this.handleMouseUp,
      onMouseMove: this.handleMouseMove,
      style
    });
  }
}
