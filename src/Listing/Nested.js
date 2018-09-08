import React, { Fragment } from "react";
import { injectState } from "freactal";
import CommentForm from "Comment/Form";
import Listing from "./Listing";

export const NestedListing = injectState(({
  id,
  showReplyForm,
  realtime,
  opId,
  item,
  listing,
  listingParams,
  state: { myContent, notabugCommentsSort },
  ...props
}) => (
  <Fragment>
    {showReplyForm ? (
      <CommentForm {...{...props, id, opId }} thingId={id} autoFocus={false} />
    ) : null}
    <div className={"sitetable nestedlisting"}>
      <Listing
        {...props}
        id={id}
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
          replyToId: id
        }}
      />
    </div>
  </Fragment>
));
