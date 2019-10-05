import React from "react";
import Helmet from "react-helmet";
import { WikiPageContent } from "/Wiki";
import { PageTemplate, PageFooter } from "/Page";
import { Config } from "@notabug/peer";

export { Reddit } from "./Reddit";
export { Banned } from "./Banned";

export const StaticPage = ({
  match: {
    params: { name }
  }
}) => (
  <PageTemplate name={name}>
    <Helmet>
      <body className="wiki-page" />
    </Helmet>
    <div className="content" role="main">
      <WikiPageContent {...{ name, identifier: Config.tabulator }} />
    </div>
    <PageFooter />
  </PageTemplate>
);
