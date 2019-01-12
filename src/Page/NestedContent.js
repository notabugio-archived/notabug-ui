import React from "react";
import { Dropdown, Link, ErrorBoundary } from "utils";
import { NestedListing } from "Comment";
import { Thing } from "Listing/Thing";
import { default as Submission } from "Submission/Submission";
import { SortSelector, CommentAreaTitle } from "snew-classic-ui";
import { useNestedListingContext } from "Listing";

export const NestedContent = React.memo(
  ({ location: { pathname }, ListingContext }) => {
    const {
      ContentContext,
      contentData,
      listingData
    } = useNestedListingContext(ListingContext);
    const { opId, listingParams } = listingData;

    return (
      <ErrorBoundary>
        <ContentContext.Provider value={contentData}>
          <a name="content" key="anchor" /* eslint-disable-line */ />
          <div className="content" role="main">
            <div className="spacer">
              <div className="sitetable linklisting" id="siteTable">
                <Thing
                  {...{ ListingContext }}
                  id={opId}
                  Loading={Submission}
                  isVisible
                  isDetail
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
                <NestedListing showReplyForm id={opId} {...{ ListingContext }} />
              </div>
            </div>
          </div>
        </ContentContext.Provider>
      </ErrorBoundary>
    );
  }
);
