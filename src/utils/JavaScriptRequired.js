import React, { Fragment } from "react";
import { Markdown } from "./Markdown";
import isNode from "detect-node";

export const JavaScriptRequired = ({ silent, children }) => isNode ? silent ? null : (
  <noscript>
    <div className="wiki-page-content md-container">
      <div className="reddit-infobar with-icon locked-infobar">
        <Markdown
          body={`
### ಠ_ಠ javascript is required for this feature

Better support for participating without it may come in the future.

Unfortunately for now you must enable JavaScript to use this.
          `}
        />
      </div>
    </div>
  </noscript>
) : <Fragment>{children || null}</Fragment>;
