import React, { useContext, useState, useCallback } from "react";
import { useNotabug } from "NabContext";
import { MAX_THING_BODY_SIZE } from "notabug-peer";
import { CommentForm as SnewCommentForm } from "snew-classic-ui";
import { JavaScriptRequired } from "utils";

export const CommentForm = ({
  ListingContext,
  replyToId: replyToIdProp,
  onHideReply
}) => {
  const { opId, submitTopic: topic, addSpeculativeId } = useContext(
    ListingContext
  );
  const { api, onMarkMine } = useNotabug();
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const replyToId = replyToIdProp || opId;
  let commentError = null;

  if (body.length > MAX_THING_BODY_SIZE)
    commentError = `this is too long (max: ${MAX_THING_BODY_SIZE})`;
  if (!body.trim().length) commentError = "a body is required";

  const onChangeBody = useCallback(evt => setBody(evt.target.value), []);

  const onSave = useCallback(
    evt => {
      evt && evt.preventDefault();
      if (isSaving || commentError) return;
      setIsSaving(true);
      return api.comment({ body, opId, topic, replyToId }).then(({ id }) => {
        onMarkMine(id);
        addSpeculativeId && addSpeculativeId(id);
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
        autoFocus={replyToId !== opId}
        commentError={body && commentError}
        onChangeBody={onChangeBody}
        onSubmit={onSave}
        onCancel={onHideReply}
      />
    </JavaScriptRequired>
  );
};
