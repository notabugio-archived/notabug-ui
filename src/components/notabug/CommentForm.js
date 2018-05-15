import React from "react";
import { CommentForm as SnewCommentForm } from "snew-classic-ui";
import { notabugCommentForm } from "state/notabug";
import { injectState } from "freactal";
import { COMMENT_BODY_MAX } from "lib/nab/validate";

export const CommentForm = notabugCommentForm(injectState(({
  state: { commentBody, isCommentTooLong },
  effects: { onChangeCommentBody, onSaveComment, onNotabugSetReplyTo },
  ...props
}) => (
  <SnewCommentForm
    {...props}
    body={commentBody}
    key={commentBody ? "notblank" : "blank"} // hack to allow defaultValue to workaround controlled input bug
    onChangeBody={e => onChangeCommentBody(e.target.value)}
    commentError={isCommentTooLong ? `this is too long (max: ${COMMENT_BODY_MAX})` : null}
    onSubmit={e => {
      e.preventDefault();
      if (!props.thingId) onNotabugSetReplyTo(null);
      onSaveComment();
    }}
    autoFocus={props.thingId ? true : false}
    onCancel={props.thingId ? () => onNotabugSetReplyTo(null) : null}
  />
)));
