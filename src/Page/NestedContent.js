import React, { useContext, useMemo, createContext } from "react";
import { Dropdown, Link } from "utils";
import { NestedListing } from "Comment";
import { Thing } from "Listing/Thing";
import { default as Submission } from "Submission/Submission";
import { SortSelector, CommentAreaTitle } from "snew-classic-ui";
import { PageFooter } from "Page/Footer";
import { useListingContent } from "Listing";

export const NestedContent = React.memo(({
  location: { pathname },
  ListingContext: BaseListingContext
}) => {
  const ListingContext = useMemo(() => createContext(), []);
  const listingProps = useContext(BaseListingContext);
  const { ids, opId, listingParams } = listingProps;
  const nestedListingProps = useListingContent({ ids, listingParams });
  const combinedProps = { ...listingProps, ...nestedListingProps };
  const listingValue = useMemo(() => combinedProps, Object.values(combinedProps));
  const { replyTree } = nestedListingProps;

  return (
    <ListingContext.Provider value={listingValue}>
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
                {...{ ListingContext, replyTree }}
              />
            </div>
          </div>
        </div>
        <PageFooter />
        <p className="bottommenu debuginfo" key="debuginfo">,
          <span className="icon">π</span> <span className="content" />
        </p>
      </React.Fragment>
    </ListingContext.Provider>
  );
});
