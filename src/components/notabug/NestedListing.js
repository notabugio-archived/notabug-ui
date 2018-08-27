import React, { Fragment } from "react";
import { injectState } from "freactal";
import { CommentForm } from "./CommentForm";
import { Listing } from "./Listing";

export const NestedListing = injectState(({
  name,
  showReplyForm,
  realtime,
  opId,
  item,
  listing,
  state: { myContent, notabugReplyToCommentId, notabugCommentsSort },
}) => (
  <Fragment>
    {showReplyForm || notabugReplyToCommentId === name ? (
      <CommentForm thingId={name} autoFocus={false} />
    ) : null}
    <div className={"sitetable nestedlisting"}>
      <Listing
        sort={notabugCommentsSort}
        listing={listing}
        myContent={myContent}
        replyToId={name}
        opId={opId || (item && item.opId)}
        collapseThreshold={0}
        realtime={realtime}
      />
    </div>
  </Fragment>
));
