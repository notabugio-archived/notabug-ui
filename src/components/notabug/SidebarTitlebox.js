import React, { Fragment } from "react";
import { SidebarTitlebox as SnewSidebarTitlebox } from "snew-classic-ui";
import { Markdown } from "./Markdown";
import { Link } from "./Link";
import { Timestamp as TimestampBase } from "./Timestamp";

const README = `
> I think all censorship should be deplored.  My position is that bits are **not a bug**.
>
> — Aaron Swartz (1986 - 2013)

**notabug** is a p2p link aggregator app that is:

 * distributed: peers backup/serve content
 * anonymous: but don't trust it to be
 * immutable: edits are not supported
 * PoW-based: **voting is slow/CPU heavy**

---

    BCH 1KtRnC9swwXbCTc8WFGBUT9pobYiizj1Ez
    BTC 13XvsLbkaiUud82sh9gh86vJB3neZRD2CK
    DCR DsYQVTvjyepvangZEy9CaJN16n1Zk97tejW
    LTC LPvfg2marjf7H16iDoa4xj7tmt5sVqw4mZ
    ETH 0x67857ED6e8834FE9f2ee8367DEc0AA0C7101B4Ab
`;

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
