import React from "react";
import LinkComponent from "./Link";
import MarkdownComponent from "./Markdown";
import { optional } from "../util";

const SidebarTitlebox = ({
  Link = LinkComponent,
  Markdown = MarkdownComponent,
  Timestamp = ({ created_utc }) => created_utc || null,
  siteprefix="r",
  subreddit,
  description,
  description_html,
  useStyle,
  subscribers,
  accounts_active_is_fuzzed,
  accounts_active,
  created_by,
  created_utc,
  bottom=null,
  isShowingCustomStyleOption,
  setStyleEnabled,
  setStyleDisabled,
  onSubscribe,
  onUnsubscribe
}) => (
  <div className="spacer">
    <div className="titlebox">
      {subreddit && (
        <h1 className="hover redditname">
          <Link className="hover" href={`/${siteprefix}/${subreddit}/`}>{subreddit}</Link>
        </h1>
      )}
      {subreddit && subreddit !== "all"  && (onSubscribe || onUnsubscribe) ? (
        <span
          className="fancy-toggle-button subscribe-button toggle"
          data-sr_name={subreddit}
          style={{ display: "none !important" }}
        >
          <a
            className="option active remove login-required"
            tabIndex={100}
            onClick={onUnsubscribe}
          >
            unsubscribe
          </a>
          <a className="option add" onClick={onSubscribe}>
            subscribe
          </a>
        </span>
      ): null}
      {subscribers ? (
        <span className="subscribers">
          <span className="number">{subscribers}</span> <span className="word">readers</span>
        </span>
      ) : null}
      {accounts_active && typeof accounts_active !== "object" ? (
        <p
          className={`users-online ${accounts_active_is_fuzzed ? "fuzzed" : ""}`}
          title="logged-in users viewing this subreddit in the past 15 minutes"
        >
          <span className="number">
            {accounts_active_is_fuzzed ? "~" : ""}
            {accounts_active}
          </span>{" "}
          <span className="word">users here now</span>
        </p>
      ) : null}
      {isShowingCustomStyleOption ? (
        <form className="toggle flairtoggle">
          <input
            checked={useStyle}
            onChange={useStyle ? setStyleDisabled : setStyleEnabled}
            id="flair_enabled"
            name="flair_enabled"
            type="checkbox"
          />
          <label htmlFor="flair_enabled">
            Enable custom subreddit styles
          </label>
        </form>
      ) : null}
      {/*<div className="tagline">
        <a
          className="author may-blank"
        >
          go1dfish
        </a>
      </div>*/}
      <form
        action="#"
        className="usertext warn-on-unload"
        id="form-t4_5rve"
      >
        <input name="thing_id" type="hidden" />
        {optional(Markdown, {
          className: "usertext-body may-blank-within md-container",
          body: description,
          html: description_html
        })}
      </form>
      <div className="bottom">
        {bottom}
        {created_by ? `created by ${created_by}` : null} <span className="age">
          <Timestamp created_utc={created_utc} />
        </span>
      </div>
      <div className="clear" />
    </div>
  </div>
);

export default SidebarTitlebox;

