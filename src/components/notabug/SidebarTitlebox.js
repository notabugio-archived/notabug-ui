/* eslint import/no-webpack-loader-syntax: off */
import README from "!raw-loader!README.md";
import React, { Fragment } from "react";
import { SidebarTitlebox as SnewSidebarTitlebox } from "snew-classic-ui";
import { Markdown } from "./Markdown";
import { Timestamp as TimestampBase } from "./Timestamp";

const Timestamp = (props) => (
  <Fragment>
    network created <TimestampBase {...props} />
  </Fragment>
);

export const SidebarTitlebox = (props) => (
  <div>
    <SnewSidebarTitlebox
      {...props}
      Markdown={Markdown}
      Timestamp={Timestamp}
      description={README}
      created={1526256000}
      created_utc={1526256000}
    />
  </div>
);
