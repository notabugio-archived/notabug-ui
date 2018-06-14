/* eslint import/no-webpack-loader-syntax: off */
import { Markdown } from "./notabug/Markdown";
import CONTENT_POLICY from "!raw-loader!CONTENT_POLICY.md";
import React from "react";

export const ContentPolicy = () => (
  <div className="content" role="main">
    <Markdown body={CONTENT_POLICY} />
  </div>
);
