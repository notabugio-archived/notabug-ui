import React, { Component } from "react";
import { Link } from "./Link";
import { withRouter } from "react-router-dom";
import VisibilitySensor from "react-visibility-sensor";
import isNode from "detect-node";

const sitename = isNode ? "this peer" : window.location.hostname; // eslint-disable-line

const version = isNode ? require("../../../package.json").version : process.env.REACT_APP_VERSION;

class FooterParentBase extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps() {
    if (this.state.hasSeen) this.setState({ hasAttributedReddit: true });
  }

  render() {
    return (
      <div className="footer-parent">
        <p className="bottommenu">
          <Link href="https://github.com/notabugio">open-source code</Link>
          {" | "}
          <Link href="https://github.com/notabugio/notabug">notabug {version}</Link>
          {" | "}
          <Link href="/help/knownpeers">known peers</Link>
        </p>
        <p className="bottommenu">&nbsp;</p>
        <p className="bottommenu">
          By using {sitename}, you agree to its
        </p>
        <p className="bottommenu">
          <Link href="/help/useragreement">User Agreement</Link>
          {", "}
          <Link href="/help/contentpolicy">Content Policy</Link>
          {" and "}
          <Link href="/help/privacypolicy">Privacy Policy</Link>
        </p>
        {/*<!-- SEE http://code.reddit.com/LICENSE see Exhibit B -->*/}
        <VisibilitySensor
          onChange={isVisible => (isVisible && this.setState({ hasSeen: true }))}
        >
          {() => this.state.hasAttributedReddit ? null : (
            <a
              href="https://www.reddit.com/code/"
              title="snew-classic-ui design forked from reddit"
              style={{
                textAlign: "center",
                display: "inline-block",
                background: "white",
                marginTop: "1em",
              }}
            >
              <h3 style={{ color: "black" }}>Interface Design</h3>
              <img
                alt="Interface Design Powered by reddit."
                src="/media/img/powered_by_reddit.png"
                style={{
                  width: 140,
                  height: 47
                }}
              />
            </a>
          )}
        </VisibilitySensor>
      </div>
    );
  }
}

export const FooterParent = withRouter(FooterParentBase);
