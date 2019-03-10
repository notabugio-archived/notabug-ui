import React from "react";
import { ErrorBoundary } from "utils";
import { usePageContext } from "NabContext";
import { PageTemplate } from "Page/Template";
import { PageFooter } from "Page/Footer";
import { ListingPage } from "Page/Listing";

export const Page = ({ listingParams, ...props }) => {
  const { idsQuery } = usePageContext();
  const {
    location: { pathname, search }
  } = props;

  return idsQuery ? (
    <PageTemplate {...props}>
      <ErrorBoundary>
        <ListingPage {...{ ...props, listingParams }} key={`${pathname}?${search}`} />
      </ErrorBoundary>
    </PageTemplate>
  ) : (
    <PageTemplate {...props}>
      <a name="content" key="anchor" /* eslint-disable-line */ />
      <div className="content" role="main">
        <ErrorBoundary>{props.children || null}</ErrorBoundary>
      </div>
      <PageFooter />
    </PageTemplate>
  );
};
