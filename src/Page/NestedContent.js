import React from "react";
import { Dropdown, Link } from "utils";
import { NestedListing } from "Listing/Nested";
import { Thing } from "Listing/Thing";
import { default as Submission } from "Submission/Submission";
import { SortSelector, CommentAreaTitle } from "snew-classic-ui";
import { NestedIds } from "Listing/NestedIds";

export const NestedContent = ({
  location: { pathname },
  opId,
  submitTopic: topic,
  listingParams
}) => (
  <NestedIds {...{ listingParams }} >
    {({ replyTree }) => (
      <div className="content" role="main">
        <div className="spacer">
          <div className="sitetable linklisting" id="siteTable">
            <Thing
              {...{ listingParams }}
              id={opId}
              Loading={Submission}
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
              opId={opId}
              id={opId}
              showReplyForm={true}
              {...{ topic, listingParams, replyTree }}
            />
          </div>
        </div>
      </div>
    )}
  </NestedIds>
);
