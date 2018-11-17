import React, { useState, useCallback } from "react";
import { PageTemplate } from "Page/Template";
import { NestedContent } from "Page/NestedContent";
import { InfiniteContent } from "Page/InfiniteContent";
import { PagedContent } from "Page/PagedContent";
import { useListingContext } from "Listing";

export const ListingPage = React.memo(({ listingParams, ...props }) => {
  const { ListingContext, listingData } = useListingContext({ listingParams });
  const [infinite, setInfinite] = useState(false);
  const { opId, isChat } = listingData;
  let content;

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
      <PageTemplate {...{ ...props, ...listingData, listingParams }}>
        {content}
      </PageTemplate>
    </ListingContext.Provider>
  );
});
