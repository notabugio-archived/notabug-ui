/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { compose, trim } from "ramda";
import { Link, Markdown } from "/utils";
import { propOr } from "ramda";
import { ThingWikiPage } from "/vendor/snew-classic-ui/components/ThingWikiPage";

export const WikiPageContent = ({
  isEditing,
  name,
  item,
  editedBody,
  asSource,
  onToggleEditing,
  onChangeEditedBody,
  onSubmitEdit
}) => {
  let body = propOr("", "body", item);

  if (asSource) {
    const lines = body
      ? body.split("\n").map(
        compose(
          s => `    ${s}`,
          trim
        )
      )
      : [];

    body = lines.join("\n");
  }

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
