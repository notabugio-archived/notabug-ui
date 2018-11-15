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
  replyTree = {},
  speculativeIds = {},
  addSpeculativeId
}) => (
  <Fragment>
    {showReplyForm ? (
      <CommentForm
        replyToId={id}
        autoFocus={false}
        {...{ id, opId, topic, onHideReply, addSpeculativeId }}
      />
    ) : null}
    <div className={"sitetable nestedlisting"}>
      <Things
        ids={keysIn(replyTree[id] || {})}
        collapseThreshold={0}
        {...{ opId, topic, listingParams, realtime, replyTree, speculativeIds, addSpeculativeId }}
      />
    </div>
  </Fragment>
);
