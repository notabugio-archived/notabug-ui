import React, { Fragment } from "react";
import { always } from "ramda";
import { injectState } from "freactal";
import { CommentForm } from "./CommentForm";
import { Listing } from "./Listing";
import pure from "components/pure";

const NestedListingBase = pure(({
  name,
  thing,
  replyTo,
  notabugApi,
  sort,
  myContent,
  showReplyForm
}) => (
  <Fragment>
    {showReplyForm || replyTo===name ? (
      <CommentForm thingId={name} autoFocus={false} />
    ) : null}
    <div className={"sitetable nestedlisting"}>
      <Listing
        sort={sort}
        myContent={myContent}
        getChains={always([
          name
            ? notabugApi.getComments(name)
            : thing.get("comments")
        ])}
        collapseThreshold={1}
      />
    </div>
  </Fragment>
));

export const NestedListing = injectState(({
  name,
  thing,
  showReplyForm,
  state: { myContent, notabugApi, notabugReplyToCommentId, notabugCommentsSort },
}) => (
  <NestedListingBase
    name={name}
    thing={thing}
    notabugApi={notabugApi}
    replyTo={(name === notabugReplyToCommentId) ? name : null}
    showReplyForm={showReplyForm}
    sort={notabugCommentsSort}
    myContent={myContent}
  />
));
