import React from "react";
import ThingLinkComponent from "./ThingLink";
import ThingCommentComponent from "./ThingComment";

const Thing = ({
  ThingLink = ThingLinkComponent,
  ThingComment = ThingCommentComponent,
  kind,
  data,
  rank,
  expanded,
  ...props
}) => {
  const Component = ({ t3: ThingLink, t1: ThingComment })[kind];
  return Component ? <Component expanded={expanded} {...{ ...props, ...data, rank }} /> : null;
};

export default Thing;
