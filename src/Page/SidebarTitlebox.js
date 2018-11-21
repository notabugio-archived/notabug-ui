import React from "react";
import { SidebarTitlebox as SnewSidebarTitlebox } from "snew-classic-ui";
import { Markdown } from "utils";

const README = `
> I think all censorship should be deplored.  My position is that bits are **not a bug**.
>
> — [Aaron Swartz](/t/whatever/comments/927cbc4d33de6ad07e4b7bab65f758f77829e6ad/the-internet's-own-boy:-the-story-of-aaron-swartz) (1986 - 2013)

notabug is a distributed content aggregator
`;

export const SidebarTitlebox = props => (
  <SnewSidebarTitlebox {...{ ...props, Markdown }} description={README} />
);
