/* eslint import/no-webpack-loader-syntax: off */
import README from "!raw-loader!README.md";
import React, { Fragment } from "react";
import { SidebarTitlebox as SnewSidebarTitlebox } from "snew-classic-ui";
import { Markdown } from "./Markdown";
import { Timestamp as TimestampBase } from "./Timestamp";
import moment from "moment";

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
      description={README + `\n\n---\nnotabug v${process.env.REACT_APP_VERSION}`}
      created={moment("2018-05-14").utc().unix()}
      created_utc={moment("2018-05-14").utc().unix()}
    />
  </div>
);
