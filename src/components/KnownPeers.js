/* eslint import/no-webpack-loader-syntax: off */
import React from "react";
import { Markdown } from "./notabug/Markdown";
import KNOWN_PEERS from "!raw-loader!KNOWN_PEERS.md";

export const KnownPeers = () => (
  <div className="content" role="main">
    <Markdown body={KNOWN_PEERS} />
  </div>
);
