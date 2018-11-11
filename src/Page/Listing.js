import React from "react";
import { PageTemplate } from "Page/Template";
import { Content } from "Page/Content";
import { NestedContent } from "Page/NestedContent";
import { useListing } from "Listing";

export const ListingPage = React.memo(({ listingParams, ...props }) => {
  const listingProps = useListing({ listingParams });
  const { opId } = listingProps;
  return (
    <PageTemplate {...{ ...props, ...listingProps, listingParams }} >
      {opId ? (
        <NestedContent { ...{ ...props, ...listingProps, listingParams }} />
      ) : (
        <Content {...props} {...listingProps} {...{ listingParams }} />
      )}
    </PageTemplate>
  );
});
