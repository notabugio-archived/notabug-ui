/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import LinkComponent from "./Link";
import MarkdownHelpComponent from "./MarkdownHelp";

const CommentForm = ({
  Link = LinkComponent,
  MarkdownHelp = MarkdownHelpComponent,
  body,
  isShowingHelp=false,
  autoFocus,
  contentPolicyUrl,
  commentError,
  onShowHelp,
  onHideHelp,
  onChangeBody,
  onCancel,
  onSubmit
}) => (
  <form
    className="usertext cloneable warn-on-unload"
    id="form-t5_mza2"
    onSubmit={onSubmit}
  >
    <input name="thing_id" type="hidden" defaultValue="t5_m" />
    <div className="usertext-edit md-container" style={{}}>
      <div className="md">
        <textarea
          cols={1}
          data-event-action="comment"
          data-type="link"
          name="text"
          rows={1}
          defaultValue={body}
          autoFocus={autoFocus}
          onChange={onChangeBody}
        />
      </div>
      <div className="bottom-area">
        {onShowHelp ? (
          <span className="help-toggle toggle" style={{}}>
            {isShowingHelp ? (
              <a
                className="option active"
                tabIndex={100}
                onClick={onHideHelp}
              >
                hide help
              </a>
            ) : (
              <a
                className="option active"
                tabIndex={100}
                onClick={onShowHelp}
              >
                formatting help
              </a>
            )}
          </span>
        ) : null}
        {contentPolicyUrl ? (
          <Link
            className="reddiquette"
            href={contentPolicyUrl}
            tabIndex={100}
            target="_blank"
          >
            content policy
          </Link>
        ) : null}
        {commentError ? (
          <span className="error">{commentError}</span>
        ) : null}
        <div className="usertext-buttons">
          <button className="save" type="submit">
            save
          </button>
          <button
            className="cancel"
            style={onCancel ? null : {
              display: "none"
            }}
            onClick={onCancel}
            type="button"
          >
            cancel
          </button>
        </div>
      </div>
      {isShowingHelp ? <MarkdownHelp /> : null}
    </div>
  </form>
);

export default CommentForm;
