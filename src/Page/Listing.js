import React, { useMemo, createContext } from "react";
import { PageTemplate } from "Page/Template";
import { Content } from "Page/Content";
import { NestedContent } from "Page/NestedContent";
import { useListing } from "Listing";

export const ListingPage = React.memo(({ listingParams, ...props }) => {
  const ListingContext = useMemo(() => createContext(), []);
  const listingProps = useListing({ listingParams });
  const listingValue = useMemo(() => listingProps, Object.values(listingProps));
  const { opId } = listingProps;
  return (
    <ListingContext.Provider value={listingValue}>
      <PageTemplate {...{ ...props, ...listingProps, listingParams }} >
        {opId ? (
          <NestedContent { ...{ ...props, opId, ListingContext }} />
        ) : (
          <Content {...{ ...props, ListingContext }} />
        )}
      </PageTemplate>
    </ListingContext.Provider>
  );
});
