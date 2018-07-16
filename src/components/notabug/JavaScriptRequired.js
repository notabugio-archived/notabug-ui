import React, { Fragment } from "react";
import { Markdown } from "./Markdown";
import isNode from "detect-node";

export const JavaScriptRequired = ({ silent, children }) => isNode ? silent ? null : (
  <noscript>
    <div className="wiki-page-content md-container">
      <Markdown
        body={`
# ಠ_ಠ javascript required

Better support for browsing without it will come in the future.

Unfortunately for now you must enable JavaScript to use this feature
        `}
      />
    </div>
  </noscript>
) : <Fragment>{children}</Fragment>;
