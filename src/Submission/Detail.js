import React from "react";
import { Dropdown, Link } from "utils";
import { NestedListing } from "Listing/Nested";
import { Thing } from "Listing/Thing";
import { default as Submission } from "./Submission";
import { SortSelector, CommentAreaTitle } from "snew-classic-ui";
import { NestedIds } from "Listing/NestedIds";

export const SubmissionDetail = ({
  location: { pathname },
  match: { params: { submission_id: notabugSubmissionId, topic } },
  listingParams
}) => (
  <NestedIds {...{ listingParams }} >
    {({ replyTree }) => (
      <div className="content" role="main">
        <div className="spacer">
          <div className="sitetable linklisting" id="siteTable">
            <Thing
              id={notabugSubmissionId}
              Loading={Submission}
              {...{ listingParams }}
              isVisible
              isViewing
              expanded
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
              showReplyForm={true}
              {...{ topic, listingParams, replyTree }}
            />
          </div>
        </div>
      </div>
    )}
  </NestedIds>
);
