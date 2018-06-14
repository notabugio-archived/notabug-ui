import React, { Fragment } from "react";
import { injectState } from "freactal";
import { CommentForm } from "./CommentForm";
import { Listing } from "./Listing";

export const NestedListing = injectState(({
  name,
  showReplyForm,
  state: { myContent, notabugReplyToCommentId, notabugCommentsSort },
}) => (
  <Fragment>
    {showReplyForm || notabugReplyToCommentId === name ? (
      <CommentForm thingId={name} autoFocus={false} />
    ) : null}
    <div className={"sitetable nestedlisting"}>
      <Listing
        sort={notabugCommentsSort}
        myContent={myContent}
        replyToId={name}
        collapseThreshold={1}
      />
    </div>
  </Fragment>
));
