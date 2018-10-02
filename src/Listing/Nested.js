import React, { Fragment } from "react";
import { keysIn } from "ramda";
import CommentForm from "Comment/Form";
import Listing from "./Listing";

export const NestedListing = ({
  id,
  showReplyForm,
  realtime,
  opId,
  replyTree={},
  ...props
}) => (
  <Fragment>
    {showReplyForm ? (
      <CommentForm {...{...props, id, opId }} thingId={id} autoFocus={false} />
    ) : null}
    <div className={"sitetable nestedlisting"}>
      <Listing
        {...{ ...props, realtime, replyTree }}
        ids={keysIn(replyTree[id] || {})}
        collapseThreshold={0}
      />
    </div>
  </Fragment>
);
