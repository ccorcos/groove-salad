import React from "react";
import { Component, Store } from "reactive-magic";
import { modMinus } from "./utils/mod-math";

// const ParamStore = Store({
//   value: 0,
//   min: 0,
//   max: 12,
//   step: 1
// });

// Given a {x, y} point and a {top, left, height, width} rect, find the polar coordinates of the point within the rect
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
  // props = {
  //    render: ({
  //      onMouseDown,
  //      onMouseUp,
  //      onMouseMove,
  //      rotation,
  //      rotating
  //    }) =>  Element
  //    onSnap: (rotation) => rotation,
  //    filterTarget: (Node) => bool
  // }
  rotateStore = Store({
    down: false,
    offset: 0,
    prev: { x: null, y: null },
    current: { x: null, y: null }
  });

  // propagate an event to parent event handlers
  propagateEvent(name, ...args) {
    const propagate = this.props[name];
    if (propagate) {
      propagate(...args);
    }
  }

  handleMouseDown = e => {
    this.propagateEvent("onMouseDown");
    if (this.props.filterTarget) {
      if (!this.props.filterTarget(e.target)) {
        return;
      }
    }
    const rotateStore = this.rotateStore;
    rotateStore.down = true;
    rotateStore.prev.x = e.pageX;
    rotateStore.prev.y = e.pageY;
    rotateStore.current.x = e.pageX;
    rotateStore.current.y = e.pageY;
  };

  handleMouseMove = e => {
    this.propagateEvent("onMouseMove");
    const rotateStore = this.rotateStore;
    if (rotateStore.down) {
      rotateStore.prev.x = rotateStore.current.x;
      rotateStore.prev.y = rotateStore.current.y;
      rotateStore.current.x = e.pageX;
      rotateStore.current.y = e.pageY;
      // get the rect and offset by an angle
      const rect = e.currentTarget.getBoundingClientRect();
      const p1 = polarize(rotateStore.prev, rect);
      const p2 = polarize(rotateStore.current, rect);
      const da = modMinus(p2.a, p1.a, 2 * Math.PI);
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
      // snap the angle if you want
      const snap = this.props.onSnap(rotateStore.offset);
      if (snap !== undefined) {
        rotateStore.offset = snap;
      }
    }
  };

  view(
    {
      render,
      onSnap,
      filterTarget,
      ...props
    }
  ) {
    return this.props.render({
      onMouseDown: this.handleMouseDown,
      onMouseUp: this.handleMouseUp,
      onMouseMove: this.handleMouseMove,
      rotation: this.rotateStore.offset,
      rotating: this.rotateStore.down
    });
  }
}
