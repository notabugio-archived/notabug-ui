import React, { useContext, useState, useCallback } from "react";
import { NabContext } from "NabContext";
import { COMMENT_BODY_MAX } from "notabug-peer";
import { CommentForm as SnewCommentForm } from "snew-classic-ui";
import { JavaScriptRequired } from "utils";

export const CommentForm = ({
  id,
  replyToId: replyToIdProp,
  opId,
  topic,
  onHideReply
}) => {
  const { api, onMarkMine } = useContext(NabContext);
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const replyToId = replyToIdProp || opId;
  let commentError = null;

  if (body.length > COMMENT_BODY_MAX)
    commentError = `this is too long (max: ${COMMENT_BODY_MAX})`;
  if (!body.trim().length) commentError = "a body is required";

  const onChangeBody = useCallback(evt => setBody(evt.target.value), []);

  const onSave = useCallback(
    evt => {
      evt && evt.preventDefault();
      if (isSaving || commentError) return;
      setIsSaving(true);
      return api.comment({ body, opId, topic, replyToId }).then(({ id }) => {
        onMarkMine(id);
        setBody("");
        setIsSaving(false);
        onHideReply && onHideReply();
      });
    },
    [body, opId, topic, replyToId, isSaving, commentError]
  );

  if (isSaving) return null;
  return (
    <JavaScriptRequired>
      <SnewCommentForm
        body={body}
        autoFocus={id !== opId}
        commentError={body && commentError}
        onChangeBody={onChangeBody}
        onSubmit={onSave}
        onCancel={onHideReply}
      />
    </JavaScriptRequired>
  );
};
