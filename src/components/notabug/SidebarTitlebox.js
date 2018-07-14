/* eslint import/no-webpack-loader-syntax: off */
import README from "!raw-loader!README.md";
import React, { Fragment } from "react";
import { SidebarTitlebox as SnewSidebarTitlebox } from "snew-classic-ui";
import { Markdown } from "./Markdown";
import { Link } from "./Link";
import { Timestamp as TimestampBase } from "./Timestamp";

const Timestamp = (props) => (
  <Fragment>
    {"network created  "}
    <Link href="/t/whatever/comments/927cbc4d33de6ad07e4b7bab65f758f77829e6ad/the-internet's-own-boy:-the-story-of-aaron-swartz">
      <TimestampBase {...props} />
    </Link>
  </Fragment>
);

export const SidebarTitlebox = (props) => (
  <div>
    <SnewSidebarTitlebox
      {...props}
      Markdown={Markdown}
      Timestamp={Timestamp}
      description={README}
      created={1526267327.437}
      created_utc={1526267327.437}
    />
  </div>
);
