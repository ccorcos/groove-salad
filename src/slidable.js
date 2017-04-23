import React from "react";
import { Component, Store } from "reactive-magic";

export default class Slidable extends Component {
  slideStore = Store({
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
    const slideStore = this.slideStore;
    slideStore.down = true;
    slideStore.prev.x = e.pageX;
    slideStore.prev.y = e.pageY;
    slideStore.current.x = e.pageX;
    slideStore.current.y = e.pageY;
  };

  handleMouseMove = e => {
    this.propagateEvent("onMouseMove");
    const slideStore = this.slideStore;
    if (slideStore.down) {
      slideStore.prev.x = slideStore.current.x;
      slideStore.prev.y = slideStore.current.y;
      slideStore.current.x = e.pageX;
      slideStore.current.y = e.pageY;
      // get the rect and offset by an angle
      const rect = e.currentTarget.getBoundingClientRect();
      const p1 = polarize(slideStore.prev, rect);
      const p2 = polarize(slideStore.current, rect);
      const da = modMinus(p2.a, p1.a, 2 * Math.PI);
      slideStore.offset += da;
    }
  };

  handleMouseUp = e => {
    this.propagateEvent("onMouseUp");
    const slideStore = this.slideStore;
    if (slideStore.down) {
      slideStore.down = false;
      slideStore.prev.x = null;
      slideStore.prev.y = null;
      slideStore.current.x = null;
      slideStore.current.y = null;
      // snap the angle if you want
      const snap = this.props.onSnap(slideStore.offset);
      if (snap !== undefined) {
        slideStore.offset = snap;
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
      rotation: this.slideStore.offset,
      rotating: this.slideStore.down
    });
  }
}
