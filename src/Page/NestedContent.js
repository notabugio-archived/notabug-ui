import React from "react";
import { Dropdown, Link } from "utils";
import { NestedListing } from "Comment";
import { Thing } from "Listing/Thing";
import { default as Submission } from "Submission/Submission";
import { SortSelector, CommentAreaTitle } from "snew-classic-ui";
import { PageFooter } from "Page/Footer";
import { useNestedListingContext } from "Listing";

export const NestedContent = React.memo(({
  location: { pathname },
  ListingContext
}) => {
  const { ContentContext, contentData, listingData } = useNestedListingContext(ListingContext);
  const { opId, listingParams } = listingData;

  return (
    <ContentContext.Provider value={contentData}>
      <React.Fragment>
        <div className="content" role="main">
          <div className="spacer">
            <div className="sitetable linklisting" id="siteTable">
              <Thing
                {...{ ListingContext }}
                id={opId}
                Loading={Submission}
                isVisible
                isViewing
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
              <NestedListing
                showReplyForm
                id={opId}
                {...{ ListingContext }}
              />
            </div>
          </div>
        </div>
        <PageFooter />
        <p className="bottommenu debuginfo" key="debuginfo">,
          <span className="icon">π</span> <span className="content" />
        </p>
      </React.Fragment>
    </ContentContext.Provider>
  );
});
