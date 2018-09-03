import React, { Fragment } from "react";
import { injectState } from "freactal";
import { CommentForm } from "Comment/Form";
import Listing from "./Listing";

export const NestedListing = injectState(({
  name,
  showReplyForm,
  realtime,
  opId,
  item,
  listing,
  listingParams,
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
        collapseThreshold={0}
        realtime={realtime}
        listingParams={{
          ...(listingParams || {}),
          space: (listingParams && listingParams.space) || {
            good: [{
              submissionIds: [opId || item && item.opId]
            }]
          },
          days: null,
          replyToId: name
        }}
      />
    </div>
  </Fragment>
));
