import React, { useState, useCallback, useMemo } from "react";
import { PageTemplate } from "Page/Template";
import { NestedContent } from "Page/NestedContent";
import { InfiniteContent } from "Page/InfiniteContent";
import { PagedContent } from "Page/PagedContent";
import { PageFooter } from "Page/Footer";
import { useListingContext } from "Listing";
import { ErrorBoundary } from "utils";

export const ListingPage = React.memo(({ listingParams, ...props }) => {
  const { ListingContext, listingData } = useListingContext({ listingParams });
  const [infinite, setInfinite] = useState(false);
  const { opId, isChat, parsedSource } = listingData;
  let content;
  const tabs = useMemo(() => parsedSource.getPairs("tab"), [parsedSource]);

  const onToggleInfinite = useCallback(evt => {
    evt && evt.preventDefault();
    setInfinite(cur => !cur);
  }, []);

  if (opId) {
    content = <NestedContent {...{ ...props, opId, ListingContext }} />;
  } else if (infinite || isChat) {
    content = (
      <InfiniteContent {...{ ...props, ListingContext, onToggleInfinite }} />
    );
  } else {
    content = (
      <PagedContent {...{ ...props, ListingContext, onToggleInfinite }} />
    );
  }
  return (
    <ListingContext.Provider value={listingData}>
      <PageTemplate {...{ ...props, ...listingData, tabs, listingParams }}>
        <ErrorBoundary>
          {content}
          {infinite || isChat ? null : (
            <React.Fragment>
              <PageFooter />
              <p className="bottommenu debuginfo" key="debuginfo">
                <span className="icon">π</span>
                <span className="content" />
              </p>
            </React.Fragment>
          )}
        </ErrorBoundary>
      </PageTemplate>
    </ListingContext.Provider>
  );
});
