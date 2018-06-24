import React, { Fragment } from "react";
import { injectState } from "freactal";
import { CommentForm } from "./CommentForm";
import { LoadingComment } from "./LoadingComment";
import { Listing } from "./Listing";

export const NestedListing = injectState(({
  Loading=LoadingComment,
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
        Loading={Loading}
        sort={notabugCommentsSort}
        myContent={myContent}
        replyToId={name}
        collapseThreshold={0}
      />
    </div>
  </Fragment>
));
