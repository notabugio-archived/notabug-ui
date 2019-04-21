import React, { useContext } from "react";
import * as R from "ramda";
import { Thing } from "/Listing/Thing";
import { ErrorBoundary } from "/utils";

export const Things = React.memo(
  ({
    Empty,
    Container = React.Fragment,
    ListingContext,
    children,
    containerProps = {},
    childrenPropName = "children",
    ids,
    ...props
  }) => {
    const { includeRanks, listingParams } = useContext(ListingContext);
    const renderThing = (id, idx) => {
      const count = parseInt(R.prop("count", listingParams) || 0, 10);

      return (
        <ErrorBoundary key={id}>
          <Thing
            {...{ ...props, ListingContext, id }}
            rank={!includeRanks ? null : count + idx + 1}
          />
        </ErrorBoundary>
      );
    };

    const rendered =
      ids.length || !Empty ? ids.map(renderThing) : [<Empty key="empty" />];

    children && rendered.push(children);
    return (
      <Container {...{ ...containerProps, [childrenPropName]: rendered }} />
    );
  }
);
