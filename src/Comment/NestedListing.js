import React, { Fragment } from "react";
import { keysIn } from "ramda";
import { CommentForm } from "Comment/Form";
import { Things } from "Listing/Things";

export const NestedListing = ({
  id,
  showReplyForm,
  realtime,
  opId,
  topic,
  listingParams,
  onHideReply,
  replyTree = {}
}) => (
  <Fragment>
    {showReplyForm ? (
      <CommentForm {...{ id, opId, topic, onHideReply }} replyToId={id} autoFocus={false} />
    ) : null}
    <div className={"sitetable nestedlisting"}>
      <Things
        {...{ opId, topic, listingParams, realtime, replyTree }}
        ids={keysIn(replyTree[id] || {})}
        collapseThreshold={0}
      />
    </div>
  </Fragment>
);
