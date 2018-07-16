import React from "react";
import { injectState } from "freactal";
import { notabugSubmissionDetail } from "state/notabug";
import { NestedListing } from "./NestedListing";
import { Thing } from "./Thing";
import { Submission } from "./Submission";
import { SortSelector, CommentAreaTitle } from "snew-classic-ui";

export const SubmissionDetailBase = notabugSubmissionDetail(injectState(({
  state: { replied, notabugSubmissionId, notabugListing, notabugCommentsSort="best" },
}) => (
  <div className="content" role="main">
    <div className="spacer">
      <div className="sitetable linklisting" id="siteTable">
        <Thing
          id={notabugSubmissionId}
          listing={notabugListing}
          Loading={Submission}
          isVisible
          isViewing
          expanded
          realtime
          redis
        />
      </div>
      <div className="commentarea">
        <CommentAreaTitle />
        <SortSelector currentSort={notabugCommentsSort} sortOptions={["hot", "new", "top"]} />
        <NestedListing
          name={notabugSubmissionId}
          showReplyForm={true}
          sort={notabugCommentsSort}
          realtime={!!replied}
        />
      </div>
    </div>
  </div>
)));

export const SubmissionDetail = (props) => (
  <SubmissionDetailBase
    {...props}
    key={props.match.params.submission_id}
  />
);
