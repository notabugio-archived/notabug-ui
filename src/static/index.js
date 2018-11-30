import React from "react";
import { tabulator } from "../config.json";
import { WikiPageContent } from "Wiki";
import { PageTemplate, PageFooter } from "Page";

export { Reddit } from "./Reddit";

export const StaticPage = ({ match: { params: { name  }} }) => (
  <PageTemplate name={name}>
    <WikiPageContent {...{ name, identifier: tabulator }} />
    <PageFooter />
  </PageTemplate>
);
