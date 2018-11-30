import React, { useContext, useState, useCallback } from "react";
import { ThingWikiPage } from "snew-classic-ui/components/ThingWikiPage";
import { useEditText } from "utils/Markdown";
import { NabContext } from "NabContext";
import { MAX_THING_BODY_SIZE } from "notabug-peer";

export const WikiPageCreate = ({ name }) => {
  const { api, me } = useContext(NabContext);
  const [isSaving, setIsSaving] = useState(false);

  const {
    value: editedBody,
    onChange: onChangeEditedBody,
    error
  } = useEditText({ maxLength: MAX_THING_BODY_SIZE });

  const onSubmitEdit = useCallback(
    evt => {
      evt && evt.preventDefault();
      if (error) return;
      setIsSaving(true);
      api.writePage(name, editedBody)
        .then(() => {
          setIsSaving(false);
        });
    },
    [api, editedBody, name, error]
  );

  if (!me) return null;

  if (isSaving) return null;

  return (
    <div className="content" role="main">
      <div className="reddit-infobar md-container-small">
        <div className="md"><p>creating a new page</p></div>
      </div>
      <ThingWikiPage
        isEditing
        pageActions={" "}
        {...{
          name,
          editedBody,
          error,
          onChangeEditedBody,
          onSubmitEdit
        }}
      />
    </div>
  );
};
