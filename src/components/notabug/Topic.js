import React, { Fragment } from "react";
import { Listing } from "./Listing";
import pure from "components/pure";
import { notabugListing } from "state/notabug";
import { injectState } from "freactal";
import { withRouter } from "react-router-dom";
import { DEF_THRESHOLD } from "state/notabug/listing";

const TopicBase = notabugListing(({ children }) => (
  <Fragment>{children}</Fragment>
));

export const TopicIndex = injectState(({
  match: { params: { sort } },
  state: { notabugListing }
}) => (
  <div className="content" role="main">
    <div className="sitetable" id="siteTable">
      <Listing
        listing={notabugListing}
        sort={sort || "hot"}
        threshold={DEF_THRESHOLD}
      />
    </div>
  </div>
));

export const Topic = withRouter(injectState(pure(({
  state: { notabugApi },
  topic,
  domain,
  children
}) => (
  <TopicBase
    key={topic + "/" + domain}
    gunChain={domain
      ? notabugApi.getSubmissionsByDomain(domain)
      : notabugApi.getSubmissions(topic)}
    children={children}
  />
))));
