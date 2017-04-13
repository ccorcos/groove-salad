import React from "react";
import ReactDOM from "react-dom";
import Counter from "./counter";
import Ball from "./ball";
import Info from "./info";

function app() {
  return (
    <div>
      <Counter />
      <Counter />
      <Counter />
      <Counter />
      <Ball />
      <Info />
    </div>
  );
}

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(app(), root);
