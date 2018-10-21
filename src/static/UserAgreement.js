import React from "react";
import { Markdown } from "utils";
import { Page } from "Page";

const USER_AGREEMENT=`
# User Agreement

By using notabug.io, you agree to these terms.

Failure to abide by this agreement may lead to service restrictions at the sole discretion of notabug.io

You agree not to use notabug.io to initiate violence against human beings.

You agree not to use notabug.io in a way that would violate the laws of applicable jurisdictions. (US/CA)

By submitting content to notabug.io you represent that you have a legal right
(through fair-use, permissive license or copyright ownership) to do so, and that any original
content (not linked content) submitted is irrevocably licensed under
[CC0](https://creativecommons.org/share-your-work/public-domain/cc0/) terms.

Each peer on the notabug network is responsible for maintaining its own user agreement

The terms of this agreement may change from time to time.  If changes are made, they will be reflected
[here](https://notabug.io/help/useragreement).
`;

export const UserAgreement = () => (
  <Page>
    <Markdown body={USER_AGREEMENT} />
  </Page>
);
