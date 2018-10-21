import { Markdown } from "utils";
import React from "react";
import { Page } from "Page";

const CONTENT_POLICY= `
# Content Policy

By using notabug.io, you agree to these terms.

Failure to abide by this agreement may lead to service restrictions at the sole discretion of notabug.io

The following content will be removed from notabug.io:

 * Sexualization of Minors
 * Personally Identifying Info/Dox
 * Malicious Software/Viruses/Phishing
 * DMCA infringments with proper notice
 * US/CA Court ordered removals

By using notabug.io you agree to avoid contributing the above content to the notabug.io peer.

These limitations are to ensure the sustainability of notabug.io on the public internet.
Abuse/DMCA/Contact: me (at) go1dfish.me

Each peer on the notabug network is responsible for maintaining its own content policy

The terms of this agreement may change from time to time.  If changes are made, they will be reflected
[here](https://notabug.io/help/contentpolicy).
`;

export const ContentPolicy = () => (
  <Page>
    <Markdown body={CONTENT_POLICY} />
  </Page>
);
