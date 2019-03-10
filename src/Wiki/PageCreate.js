import React, { useState, useCallback } from "react";
import { ThingWikiPage } from "snew-classic-ui/components/ThingWikiPage";
import { useEditText } from "utils/Markdown";
import { useNotabug } from "NabContext";
import { Constants } from "notabug-peer";

export const WikiPageCreate = ({ name }) => {
  const { api, me } = useNotabug();
  const [isSaving, setIsSaving] = useState(false);

  const {
    value: editedBody,
    onChange: onChangeEditedBody,
    error
  } = useEditText({ maxLength: Constants });

  const onSubmitEdit = useCallback(
    evt => {
      evt && evt.preventDefault();
      if (error) return;
      setIsSaving(true);
      api.writePage(name, editedBody).then(() => setIsSaving(false));
    },
    [api, editedBody, name, error]
  );

  if (!me) return null;

  if (isSaving) return null;

  return (
    <React.Fragment>
      <div className="new-wikipage-banner reddit-infobar md-container-small">
        <div className="md">
          <p>creating a new page</p>
        </div>
      </div>
      <ThingWikiPage
        isEditing
        pageActions={" "}
        {...{
          name,
          editedBody,
          error: editedBody && error,
          onChangeEditedBody,
          onSubmitEdit
        }}
      />
    </React.Fragment>
  );
};
