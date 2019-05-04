import React from "react";
import { withRouter } from "react-router-dom";
import { usePageContext } from "/NabContext";
import { NestedContent } from "/Page/NestedContent";
import { InfiniteContent } from "/Page/InfiniteContent";
import { PagedContent } from "/Page/PagedContent";
import { PageFooter } from "/Page/Footer";
import { useListingContext } from "/Listing";
import { useToggle } from "/utils";

export const ListingPage = withRouter(
  React.memo(props => {
    const { idsQuery, specQuery, count, limit } = usePageContext();
    const { ListingContext, listingData } = useListingContext({
      idsQuery,
      specQuery,
      count,
      limit
    });
    const [infinite, onToggleInfinite] = useToggle(false);
    const { opId, isChat } = listingData;
    const cProps = { ...props, opId, ListingContext, onToggleInfinite };
    let Content = PagedContent;

    if (infinite || isChat) Content = InfiniteContent;
    if (opId) Content = NestedContent;

    return (
      <ListingContext.Provider value={listingData}>
        <Content {...cProps} />
        {infinite || isChat ? null : (
          <React.Fragment>
            <PageFooter />
            <p className="bottommenu debuginfo" key="debuginfo">
              <span className="icon">π</span>
              <span className="content" />
            </p>
          </React.Fragment>
        )}
      </ListingContext.Provider>
    );
  })
);
