import React from "react";
import { Component, Derive, Store } from "reactive-magic";
import MouseStore from "./mouse";
import SizeStore from "./size";

const InfoStore = Store({
  x: Derive(() => MouseStore.x / SizeStore.width),
  y: Derive(() => MouseStore.y / SizeStore.height)
});

export default class Info extends Component {
  view() {
    return (
      <ul>
        <li>x: {InfoStore.x}</li>
        <li>y: {InfoStore.y}</li>
      </ul>
    );
  }
}
