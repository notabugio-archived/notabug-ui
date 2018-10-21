import React from "react";
import { PageTemplate } from "Page/Template";
import { PageFooter } from "Page/Footer";
import { ListingPage } from "Page/Listing";

export const Page = ({ listingParams, ...props }) =>
  listingParams ? <ListingPage {...{ ...props, listingParams }} /> : (
    <PageTemplate {...props}>
      <div className="content" role="main">
        {props.children}
      </div>
      <PageFooter />
    </PageTemplate>
  );
