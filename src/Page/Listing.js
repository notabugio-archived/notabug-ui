import React from "react";
import { PageTemplate } from "Page/Template";
import { Content } from "Page/Content";
import { NestedContent } from "Page/NestedContent";
import { useListingContext } from "Listing";

export const ListingPage = React.memo(({ listingParams, ...props }) => {
  const { ListingContext, listingData } = useListingContext({ listingParams });
  const { opId } = listingData;
  return (
    <ListingContext.Provider value={listingData}>
      <PageTemplate {...{ ...props, ...listingData, listingParams }} >
        {opId ? (
          <NestedContent { ...{ ...props, opId, ListingContext }} />
        ) : (
          <Content {...{ ...props, ListingContext }} />
        )}
      </PageTemplate>
    </ListingContext.Provider>
  );
});
