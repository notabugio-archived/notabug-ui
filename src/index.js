import "@babel/polyfill";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "snew-classic-ui/static/css/minimal.css";
import "snew-classic-ui/static/css/wiki.css";
import "styles/index.css";
import { App } from "App";
import { ErrorBoundary } from "utils";
import { unregister } from "utils/registerServiceWorker";

try {
  localStorage.removeItem("gun/");
  localStorage.removeItem("gap/gun/");
} catch (e) {
  console.error("error clearing localStorage", e.stack || e);
}

const jsx = (
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);

try {
  ReactDOM.render(jsx, document.body);
} catch (e) {
  console.error(e.stack || e);
  try {
    localStorage.removeItem("gun/");
    localStorage.removeItem("gap/gun/");
  } catch (e) {
    console.error(e.stack || e);
  }

  ReactDOM.render(jsx, document.body);
}

unregister();
