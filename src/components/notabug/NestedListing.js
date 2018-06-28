import React, { Fragment } from "react";
import { injectState } from "freactal";
import { CommentForm } from "./CommentForm";
import { Comment } from "./Comment";
import { Listing } from "./Listing";

export const NestedListing = injectState(({
  Loading=Comment,
  name,
  showReplyForm,
  realtime,
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
        realtime={realtime}
      />
    </div>
  </Fragment>
));
