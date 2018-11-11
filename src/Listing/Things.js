import React from "react";
import { Thing } from "Listing/Thing";
import { path } from "ramda";

export const Things = React.memo(({
  Empty,
  Container = React.Fragment,
  children,
  containerProps = {},
  childrenPropName = "children",
  ids,
  noRank,
  myContent = {},
  ...props
}) => {
  const renderThing = (idx, id) => {
    const count = parseInt(path(["listingParams", "count"], props) || 0);
    return (
      <Thing
        {...{ ...props, id }}
        key={id}
        isMine={!!myContent[id]}
        rank={noRank ? null : count + idx + 1}
      />
    );
  };

  if (!ids.length && Empty) return <Empty />;
  const rendered = ids.map((id, idx) => renderThing(idx, id));
  children && rendered.push(children);
  return <Container {...{ ...containerProps, [childrenPropName]: rendered }} />;
});
