/* eslint import/no-webpack-loader-syntax: off */
import "@babel/polyfill";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "snew-classic-ui/static/css/minimal.css";
import "snew-classic-ui/static/css/wiki.css";
import "react-tippy/dist/tippy.css";
import "styles/index.css";
import { App } from "App";
import { unregister } from "utils/registerServiceWorker";

try {
  localStorage.removeItem("gun/");
  localStorage.removeItem("gap/gun/");
} catch (e) {
  console.error("error clearing localStorage", e.stack || e);
}

try {
  ReactDOM.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    document.body
  );
} catch (e) {
  console.error(e.stack || e);
  localStorage.removeItem("gun/");
  localStorage.removeItem("gap/gun/");
  ReactDOM.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    document.body
  );
}

unregister();
