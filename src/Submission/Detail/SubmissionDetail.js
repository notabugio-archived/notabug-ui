import React from "react";
import { injectState } from "freactal";
import { Dropdown, Link } from "utils";
import { NestedListing } from "Listing/Nested";
import { Thing } from "Listing/Thing";
import { Submission } from "Submission";
import { submissionDetailProvider } from "./state";
import { SortSelector, CommentAreaTitle } from "snew-classic-ui";

export const SubmissionDetailBase = ({
  location: { pathname },
  state: { replied, notabugSubmissionId, notabugSubmissionTopic: topic },
  listingParams
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
        <SortSelector
          {...{ Dropdown, Link }}
          currentSort={listingParams.sort || "best"}
          permalink={pathname}
          sortOptions={["best", "hot", "new", "top", "controversial"]}
        />
        <NestedListing
          opId={notabugSubmissionId}
          id={notabugSubmissionId}
          topic={topic}
          showReplyForm={true}
          realtime={!!replied}
          listingParams={listingParams}
        />
      </div>
    </div>
  </div>
);

const ConnectedSubmissionDetail = submissionDetailProvider(injectState(SubmissionDetailBase));

export const SubmissionDetail = (props) => (
  <ConnectedSubmissionDetail {...props} key={props.match.params.submission_id} />
);
