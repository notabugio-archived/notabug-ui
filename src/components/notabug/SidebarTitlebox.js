/* eslint import/no-webpack-loader-syntax: off */
import README from "!raw-loader!README.md";
import React from "react";
import { SidebarTitlebox as SnewSidebarTitlebox } from "snew-classic-ui";
import { Markdown } from "./Markdown";
import { Timestamp } from "./Timestamp";

export const SidebarTitlebox = (props) => (
  <div>
    <SnewSidebarTitlebox
      {...props}
      Markdown={Markdown}
      Timestamp={Timestamp}
      description={README + `\n\n---\nnotabug v${process.env.REACT_APP_VERSION}`}
      created={(new Date())}
      created_utc={(new Date())}
    />
  </div>
);
