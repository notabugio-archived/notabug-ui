/* eslint import/no-webpack-loader-syntax: off */
import React from "react";
import { Markdown } from "./notabug/Markdown";
//import KNOWN_PEERS from "!raw-loader!KNOWN_PEERS.md";

const KNOWN_PEERS=`
# Known Notabug Peers

These are all the public peers known to exist on the notabug network.

 * https://blubit.space and https://redbit.space
 * https://communard.org/
 * https://dontsuemebro.com/
 * http://isafeature.com
 * http://liberated.site
 * https://notabug.io
 * https://redguardsaustin.com

This list does not represent an endorsement of these peers.

Different peers may maintain a more or less restrictive content policy and differing featuresets.


## Peer Setup

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
    nvm use 10 && npm install -g yarn forever && git clone https://github.com/notabugio/notabug.git && cd notabug
    yarn start

This will give you a basic ram only peer connected to notabug.io serving the UI on 0.0.0.0:3001

See https://github.com/notabugio/notabug/tree/master/peer-configs for more config examples.

For a more full featured peer:

    yarn server

This will give you 3 scoring ram peers on ports 3001, 3002, 3003 suitable for hosting behind nginx or another reverse proxy.
`;

export const KnownPeers = () => (
  <div className="content" role="main">
    <Markdown body={KNOWN_PEERS} />
  </div>
);
