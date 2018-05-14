/* eslint import/no-webpack-loader-syntax: off */
import README from "!raw-loader!README.md";
import React from "react";
import { SidebarTitlebox as SnewSidebarTitlebox } from "snew-classic-ui";
import { Markdown } from "./Markdown";

export const SidebarTitlebox = (props) => (
  <div>
    <SnewSidebarTitlebox
      {...props}
      Markdown={Markdown}
      description={README}
    />
  </div>
);
