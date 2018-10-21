import React from "react";
import { PageTemplate } from "Page/Template";
import { Content } from "Page/Content";
import { NestedContent } from "Page/NestedContent";
import { ListingIds } from "Listing/Ids";

export const ListingPage = ({ listingParams, ...props }) => (
  <ListingIds {...{ listingParams }}>
    {({ opId, ...listingProps }) => (
      <PageTemplate {...props} { ...listingProps} {...{ listingParams }} >
        {opId ? (
          <NestedContent {...props} {...listingProps} {...{ opId, listingParams }} />
        ) : (
          <Content {...props} {...listingProps} {...{ listingParams }} />
        )}
      </PageTemplate>
    )}
  </ListingIds>
);
