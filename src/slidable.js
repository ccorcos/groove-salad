import React from "react";
import { Component, Store } from "reactive-magic";

export default class Slidable extends Component {
  slide = Store({
    down: false,
    offset: { x: null, y: null },
    prev: { x: null, y: null },
    current: { x: null, y: null }
  });

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
    const slide = this.slide;
    slide.down = true;
    slide.prev.x = e.pageX;
    slide.prev.y = e.pageY;
    slide.current.x = e.pageX;
    slide.current.y = e.pageY;
  };

  handleMouseMove = e => {
    this.propagateEvent("onMouseMove");
    const slide = this.slide;
    if (slide.down) {
      slide.prev.x = slide.current.x;
      slide.prev.y = slide.current.y;
      slide.current.x = e.pageX;
      slide.current.y = e.pageY;
      slide.offset.x += current.x - prev.x;
      slide.offset.y += current.y - prev.y;
    }
  };

  handleMouseUp = e => {
    this.propagateEvent("onMouseUp");
    const slide = this.slide;
    if (slide.down) {
      slide.down = false;
      slide.prev.x = null;
      slide.prev.y = null;
      slide.current.x = null;
      slide.current.y = null;
    }
  };

  getStyle() {
    const style = this.props.element.props.style;
    const slide = this.slide;
    const transform = [
      this.props.x && `translateX(${slide.offset.x}px)`,
      this.props.y && `translateY(${slide.offset.y}px)`
    ]
      .filter(Boolean)
      .join(" ");
    if (style) {
      if (style.transform) {
        return Object.assign({}, style, {
          transform: `${transform} ${style.transform}`
        });
      } else {
        return Object.assign({}, style, {
          transform
        });
      }
    } else {
      return {
        transform
      };
    }
  }

  view() {
    const {
      element,
      filterTarget,
      ...props
    } = this.props;
    const style = this.getStyle();
    return React.cloneElement(this.props.element, {
      ...props,
      onMouseDown: this.handleMouseDown,
      onMouseUp: this.handleMouseUp,
      onMouseMove: this.handleMouseMove,
      style
    });
  }
}
