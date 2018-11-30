import React from "react";
import { Link, Markdown } from "utils";
import { propOr } from "ramda";
import { ThingWikiPage } from "snew-classic-ui/components/ThingWikiPage";

export const WikiPageContent = ({
  isEditing,
  name,
  item,
  editedBody,
  onToggleEditing,
  onChangeEditedBody,
  onSubmitEdit
}) => {
  const body = propOr("", "body", item);
  return (
    <ThingWikiPage
      pageActions={
        onToggleEditing ? (
          <span className="pageactions">
            <a
              href=""
              onClick={onToggleEditing}
              className={`wikiaction wikiaction-index ${
                isEditing ? "" : "wikiaction-current"
              }`}
            >
              view
            </a>{" "}
            <a
              href=""
              onClick={onToggleEditing}
              className={`wikiaction wikiaction-index ${
                isEditing ? "wikiaction-current" : ""
              }`}
            >
              edit
            </a>
          </span>
        ) : null
      }
      {...{
        Link,
        Markdown,
        name: onToggleEditing && name,
        content_md: body,
        editedBody,
        isEditing,
        onToggleEditing,
        onChangeEditedBody,
        onSubmitEdit
      }}
    />
  );
};
