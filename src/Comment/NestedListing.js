import React, { Fragment, useContext } from "react";
import { keysIn } from "ramda";
import { CommentForm } from "Comment/Form";
import { Things } from "Listing/Things";

export const NestedListing = ({
  id,
  showReplyForm,
  realtime,
  onHideReply,
  ListingContext
}) => {
  const { replyTree={} } = useContext(ListingContext);

  return (
    <Fragment>
      {showReplyForm ? (
        <CommentForm
          replyToId={id}
          autoFocus={false}
          {...{ id, ListingContext, onHideReply }}
        />
      ) : null}
      <div className={"sitetable nestedlisting"}>
        <Things
          ids={keysIn(replyTree[id] || {})}
          collapseThreshold={0}
          {...{ ListingContext, realtime }}
        />
      </div>
    </Fragment>
  );
};
