import React from "react";
import ThingComponent from "./Thing";
import { optional } from "../util";
import CommentFormComponent from "./CommentForm";

const NestedListing = ({
  Thing = ThingComponent,
  CommentForm = CommentFormComponent,
  allChildren,
  className = "",
  name,
  replyTo,
  showReplyForm = false,
  ...props
}) => [
  ((replyTo && name === replyTo) || showReplyForm) && (
    <CommentForm thingId={name} key="replyform" />
  ),
  <div className={`sitetable ${className}`} id={`siteTable_${name}`} key="listing">
    {(allChildren || []).map((thing, idx) => [
      optional(Thing, { ...props, ...thing, key: thing.data.id, rank: idx + 1, replyTo }),
      <div className="clearleft" key={thing.data.id + "clear"} />
    ])}
  </div>
];

export default NestedListing;

