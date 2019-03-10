import React from "react";
import Helmet from "react-helmet";
import { tabulator } from "../config.json";
import { WikiPageContent } from "Wiki";
import { PageTemplate, PageFooter } from "Page";

export { Reddit } from "./Reddit";
export { Banned } from "./Banned";

export const StaticPage = ({ match: { params: { name }} }) => (
  <PageTemplate name={name}>
    <Helmet>
      <body className="wiki-page" />
    </Helmet>
    <div className="content" role="main">
      <WikiPageContent {...{ name, identifier: tabulator }} />
    </div>
    <PageFooter />
  </PageTemplate>
);
