import React from "react";
import { injectState } from "freactal";
import { notabugSubmissionDetail } from "state/notabug";
import { NestedListing } from "./NestedListing";
import { Thing } from "./Thing";
import { SortSelector, CommentAreaTitle } from "snew-classic-ui";

export const SubmissionDetail = notabugSubmissionDetail(injectState(({
  state: { notabugSubmissionId, notabugListing, notabugCommentsSort="best" },
}) => (
  <div className="content" role="main">
    <div className="spacer">
      <div className="sitetable linklisting" id="siteTable">
        <Thing
          id={notabugSubmissionId}
          listing={notabugListing}
          isViewing
          expanded
        />
      </div>
      <div className="commentarea">
        <CommentAreaTitle />
        <SortSelector currentSort={notabugCommentsSort} sortOptions={["hot", "new", "top"]} />
        <NestedListing
          name={notabugSubmissionId}
          showReplyForm={true}
          sort={notabugCommentsSort}
          realtime
        />
      </div>
    </div>
  </div>
)));
