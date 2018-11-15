import React, { useContext } from "react";
import { Thing } from "Listing/Thing";
import { path } from "ramda";

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
    const { includeRanks } = useContext(ListingContext);
    const renderThing = (id, idx) => {
      const count = parseInt(path(["listingParams", "count"], props) || 0);
      return (
        <Thing
          {...{ ...props, ListingContext, id }}
          key={id}
          rank={!includeRanks ? null : count + idx + 1}
        />
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
