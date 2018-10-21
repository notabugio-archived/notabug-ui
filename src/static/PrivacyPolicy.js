import React from "react";
import { Markdown } from "utils";
import { Page } from "Page";

const PRIVACY_POLICY=`
# Privacy Policy

By using notabug.io, you agree to these terms.

notabug.io does not collect or store any personal info of its users.
This includes IP addresses and passwords.

Each peer on the notabug network is responsible for maintaining its own privacy policy

The terms of this agreement may change from time to time.  If changes are made, they will be reflected
[here](https://notabug.io/help/privacypolicy).
`;

export const PrivacyPolicy = () => (
  <Page>
    <Markdown body={PRIVACY_POLICY} />
  </Page>
);
