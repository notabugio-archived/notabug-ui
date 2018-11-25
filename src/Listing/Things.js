import React, { useContext } from "react";
import { Thing } from "Listing/Thing";
import { prop } from "ramda";
import { ErrorBoundary } from "utils";

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
      const count = parseInt(prop("count", listingParams) || 0);
      return (
        <ErrorBoundary>
          <Thing
            {...{ ...props, ListingContext, id }}
            key={id}
            rank={!includeRanks ? null : count + idx + 1}
          />
        </ErrorBoundary>
      );
    };

    if (!ids.length && Empty) return <Empty />;
    const rendered = ids.map(renderThing);
    children && rendered.push(children);
    return (
      <Container {...{ ...containerProps, [childrenPropName]: rendered }} />
    );
  }
);
