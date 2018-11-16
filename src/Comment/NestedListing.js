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
  const { ContentContext } = useContext(ListingContext);
  const { replyTree = {} } = useContext(ContentContext) || {};

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
