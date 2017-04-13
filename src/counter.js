import React from "react";
import { Component, Store } from "reactive-magic";

export default class Counter extends Component {
  store = Store({ count: 0 });

  increment = () => {
    this.store.count += 1;
  };

  decrement = () => {
    this.store.count -= 1;
  };

  view() {
    return (
      <div>
        <button onClick={this.decrement}>{"-"}</button>
        <span>{this.store.count}</span>
        <button onClick={this.increment}>{"+"}</button>
      </div>
    );
  }
}
