/* eslint import/no-webpack-loader-syntax: off */
import "babel-polyfill";
import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { Helmet } from "react-helmet";
import "snew-classic-ui/static/css/minimal.css";
import "./index.css";
import { App } from "./components/notabug";
import { BrowserRouter } from "react-router-dom";
import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render((
  <Fragment>
    <Helmet>
      <title>notabug: the back page of the internet</title>
    </Helmet>
    <BrowserRouter><App /></BrowserRouter>
  </Fragment>
), document.body);
registerServiceWorker();
