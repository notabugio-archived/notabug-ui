import React, { PureComponent } from "react";
import Spinner from "react-spinkit";
import { JavaScriptRequired } from "./JavaScriptRequired";

export class Loading extends PureComponent {
  render() {
    const {
      message="waiting for data",
      isVisible=true,
      color="#cee3f8",
      name="ball-grid-pulse"
    } = this.props;

    return (
      <JavaScriptRequired>
        <div
          className="thing link"
          onClick={this.onFetchItem}
        >
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
  }
}
