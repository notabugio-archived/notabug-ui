/* eslint import/no-webpack-loader-syntax: off */
import React from "react";
import { Markdown } from "./notabug/Markdown";
import PRIVACY_POLICY from "!raw-loader!PRIVACY_POLICY.md";

export const PrivacyPolicy = () => (
  <div className="content" role="main">
    <Markdown body={PRIVACY_POLICY} />
  </div>
);
