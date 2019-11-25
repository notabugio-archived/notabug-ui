import React, { useState, useCallback } from "react";
import VisibilitySensor from "react-visibility-sensor";
import isNode from "detect-node";
import { Link } from "/utils";
import { useNotabug } from "/NabContext";

const sitename = isNode ? "this peer" : window.location.hostname; // eslint-disable-line
const version = require("../../package.json").version;

export const PageFooter = () => {
  const { hasAttributedReddit, setHasAttributedReddit } = useNotabug();
  const [displayRedditAttribution] = useState(!hasAttributedReddit);

  const onChangeVisibility = useCallback(isVisible => {
    if (isVisible) setHasAttributedReddit(true);
  }, []);

  return (
    <div className="footer-parent">
      <p className="bottommenu">
        <Link href="/help/faq">FAQ</Link>
        {" | "}
        <Link href="https://github.com/notabugio">open-source code</Link>
        {" | "}
        <Link href="https://github.com/notabugio/notabug">
          notabug {version}
        </Link>
        {" | "}
        <Link href="/help/knownpeers">known peers</Link>
      </p>
      <p className="bottommenu">&nbsp;</p>
      <p className="bottommenu">By using {sitename}, you agree to its</p>
      <p className="bottommenu">
        <Link href="/help/useragreement">User Agreement</Link>
        {", "}
        <Link href="/help/contentpolicy">Content Policy</Link>
        {" and "}
        <Link href="/help/privacypolicy">Privacy Policy</Link>
      </p>
      {/* <!-- SEE http://code.reddit.com/LICENSE see Exhibit B -->*/}
      <VisibilitySensor onChange={onChangeVisibility}>
        {() =>
          !displayRedditAttribution ? null : (
            <a
              href="https://www.reddit.com/code/"
              title="snew-classic-ui design forked from reddit"
              style={{
                textAlign: "center",
                display: "inline-block",
                marginTop: "1em"
              }}
            >
              <h3>Interface Design</h3>
              <img
                alt="Interface Design Powered by reddit."
                src={require("/media/img/powered_by_reddit.png")}
                style={{
                  width: 140,
                  height: 47
                }}
              />
            </a>
          )
        }
      </VisibilitySensor>
    </div>
  );
};
