/* eslint import/no-webpack-loader-syntax: off */
import React from "react";
import ReactDOM from "react-dom";
import "snew-classic-ui/static/css/reddit.css";
import "./index.css";
import { App } from "./components/notabug";
import { BrowserRouter } from "react-router-dom";
import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, document.body);
registerServiceWorker();
