import React from "react";
import { injectState } from "freactal";
import { NestedListing } from "Listing/Nested";
import { Thing } from "Listing/Thing";
import { Submission } from "Submission";
import { submissionDetailProvider } from "./state";
import { SortSelector, CommentAreaTitle } from "snew-classic-ui";

export const SubmissionDetailBase = ({
  state: { replied, notabugSubmissionId, notabugCommentsSort="best" },
}) => (
  <div className="content" role="main">
    <div className="spacer">
      <div className="sitetable linklisting" id="siteTable">
        <Thing
          id={notabugSubmissionId}
          Loading={Submission}
          isVisible
          isViewing
          expanded
          realtime={!!replied}
        />
      </div>
      <div className="commentarea">
        <CommentAreaTitle />
        <SortSelector currentSort={notabugCommentsSort} sortOptions={["hot", "new", "top"]} />
        <NestedListing
          name={notabugSubmissionId}
          showReplyForm={true}
          sort={notabugCommentsSort}
          opId={notabugSubmissionId}
          realtime={!!replied}
        />
      </div>
    </div>
  </div>
);

const ConnectedSubmissionDetail = submissionDetailProvider(injectState(SubmissionDetailBase));

export const SubmissionDetail = (props) => (
  <ConnectedSubmissionDetail {...props} key={props.match.params.submission_id} />
);
