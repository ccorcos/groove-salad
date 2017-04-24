import React from "react";
import { Component, Store } from "reactive-magic";

export default class Slidable extends Component {
  slideStore = Store({
    down: false,
    offset: { x: null, y: null },
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
    slideStore.prev = {
      x: e.pageX,
      y: e.pageY
    };
    slideStore.current = {
      x: e.pageX,
      y: e.pageY
    };
  };

  handleMouseMove = e => {
    this.propagateEvent("onMouseMove");
    const slideStore = this.slideStore;
    if (slideStore.down) {
      slideStore.prev = slideStore.current;
      slideStore.current = {
        x: e.pageX,
        y: e.pageY
      };
      slideStore.offset = {
        x: slideStore.offset.x + slideStore.current.x - slideStore.prev.x,
        y: slideStore.offset.y + slideStore.current.y - slideStore.prev.y
      };
    }
  };

  handleMouseLeave = e => {
    this.handleMouseUp(e);
  };

  handleMouseUp = e => {
    this.propagateEvent("onMouseUp");
    const slideStore = this.slideStore;
    if (slideStore.down) {
      slideStore.down = false;
      slideStore.prev = { x: null, y: null };
      slideStore.current = { x: null, y: null };
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
      onMouseLeave: this.handleMouseLeave,
      offset: this.slideStore.offset,
      sliding: this.slideStore.down
    });
  }
}
