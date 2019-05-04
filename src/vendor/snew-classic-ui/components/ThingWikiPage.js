import React from "react";
import LinkComponent from "./Link";
import MarkdownComponent from "./Markdown";

export const ThingWikiPage = ({
  Link = LinkComponent,
  Markdown = MarkdownComponent,
  name,
  pageActions,
  error,
  content_md,
  content_html,
  isEditing,
  editedBody,
  onSubmitEdit,
  onToggleEditing,
  onChangeEditedBody
}) => (
  <React.Fragment>
    <span>
      {name ? <h1 className="wikititle">{name}</h1> : null}
      {typeof pageActions === "undefined" ? (
        <span className="pageactions">
          <Link
            href=""
            className="wikiaction wikiaction-index wikiaction-current"
          >
            view
          </Link>
        </span>
      ) : (
        pageActions
      )}
    </span>
    {error ? (
      <div id="wiki_special_error">
        <h1>Errors:</h1>
        <span id="specials" className="error">
          {error}
        </span>
      </div>
    ) : null}
    {isEditing ? (
      <div className="wiki-page-content md-container">
        <form id="editform" onSubmit={onSubmitEdit}>
          <textarea
            cols="20"
            rows="20"
            id="wiki_page_content"
            name="content"
            value={editedBody}
            style={{ width: "100%" }}
            onChange={onChangeEditedBody}
          />
          <input
            type="submit"
            id="wiki_save_button"
            className="wiki_button"
            value="save"
          />
          {onToggleEditing ? (
            <button onClick={onToggleEditing} className="wiki_button">
              cancel
            </button>
          ) : null}
        </form>
      </div>
    ) : (
      <Markdown
        key="wiki-markdown"
        className="wiki-page-content md-container"
        body={content_md}
        html={content_html}
      />
    )}
  </React.Fragment>
);
