/* eslint import/no-webpack-loader-syntax: off */
import React from "react";
import { Markdown } from "./notabug/Markdown";
import USER_AGREEMENT from "!raw-loader!USER_AGREEMENT.md";

export const UserAgreement = () => (
  <div className="content" role="main">
    <Markdown body={USER_AGREEMENT} />
  </div>
);
