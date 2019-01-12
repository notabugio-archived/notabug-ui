/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import Spinner from "react-spinkit";
import { JavaScriptRequired } from "./JavaScriptRequired";

export const Loading = ({
  message="waiting for data",
  isVisible=true,
  color="#cee3f8",
  name="ball-grid-pulse"
}) => (
  <JavaScriptRequired>
    <div className="thing link" >
      <a className="thumbnail">
        {isVisible ? (
          <Spinner
            name={name}
            color={color}
          />
        ) : null}
      </a>
      <div className="entry unvoted">
        <p className="title">
          <span>&nbsp;</span>
        </p>
        <p className="tagline">
          {message}
        </p>
        <ul className="flat-list buttons">
          <li className="first">
            <a href="">&nbsp;</a>
          </li>
        </ul>
      </div>
      <div className="clearleft" />
    </div>
  </JavaScriptRequired>
);
