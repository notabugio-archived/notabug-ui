import React from "react";
import { ErrorBoundary } from "utils";
import { PageTemplate } from "Page/Template";
import { PageFooter } from "Page/Footer";
import { ListingPage } from "Page/Listing";

export const Page = ({ listingParams, ...props }) =>
  listingParams ? (
    <ListingPage {...{ ...props, listingParams }} />
  ) : (
    <PageTemplate {...props}>
      <a name="content" key="anchor" />
      <div className="content" role="main">
        <ErrorBoundary>{props.children}</ErrorBoundary>
      </div>
      <PageFooter />
    </PageTemplate>
  );
