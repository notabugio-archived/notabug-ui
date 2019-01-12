/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Fragment } from "react";
import ExpandoComponent from "./Expando";
import LinkComponent from "./Link";
import AuthorLinkComponent from "./AuthorLink";
import { optional } from "../util";

const ThingLink = ({
  Link = LinkComponent,
  Expando = ExpandoComponent,
  AuthorLink = AuthorLinkComponent,
  Timestamp = ({ created }) => created,
  onClick,
  onShare,
  onSave,
  onHide,
  onReport,
  onVoteUp,
  onVoteDown,
  isDetail,
  id,
  expanded = false,
  name,
  author,
  author_fullname,
  domain,
  over_18,
  rank,
  stickied,
  score,
  likes,
  num_comments,
  subreddit,
  subreddit_id,
  title,
  author_flair_text,
  author_flair_css_class,
  link_flair_text,
  link_flair_css_class,
  url,
  linkTarget,
  nofollow,
  is_self,
  created,
  created_utc,
  edited,
  expandoType = "selftext",
  selftext,
  selftext_html,
  permalink,
  thumbnail,
  locked,
  brand_safe,
  banned_by,
  meta_thing,
  siteprefix,
  scoreTooltip,
  onToggleExpando,
  onToggleEditing,
  preTagline,
  postTagline,
  preButtons,
  postButtons,
  ...props
}) => (
  <div
    className={[
      `thing id-${id} odd link ${stickied ? "stickied" : ""}`,
      banned_by ? "spam" : "",
      is_self ? "self" : "",
      locked ? "locked" : "",
      ((link_flair_css_class || link_flair_text) && "linkflair") || "",
      (link_flair_css_class && `linkflair-${link_flair_css_class}`) || ""
    ].join(" ")}
    data-author={author}
    data-author-fullname={author_fullname}
    data-domain={domain}
    data-fullname={name}
    data-rank={rank}
    data-subreddit={subreddit}
    data-subreddit-fullname={subreddit_id}
    data-timestamp={created_utc}
    data-type="link"
    data-url={url}
    id={`thing_${name}`}
    onClick={onClick}
  >
    <p className="parent" />
    {rank ? <span className="rank">{rank}</span> : null}
    <div
      className={`midcol ${
        likes === false ? "dislikes" : likes === true ? "likes" : "unvoted"
      }`}
    >
      {onVoteUp ? (
        <div
          aria-label="upvote"
          className={`arrow ${
            likes === true ? "upmod" : "up"
          } login-required access-required`}
          data-event-action="upvote"
          role="button"
          tabIndex={0}
          onClick={onVoteUp}
        />
      ) : null}
      <Fragment>
        <div className="score dislikes" title={scoreTooltip}>
          {score > 10000 ? (score / 1000.0).toFixed(1) + "k" : score}
        </div>
        <div className="score unvoted" title={scoreTooltip}>
          {score > 10000 ? (score / 1000.0).toFixed(1) + "k" : score}
        </div>
        <div className="score likes" title={scoreTooltip}>
          {score > 10000 ? (score / 1000.0).toFixed(1) + "k" : score}
        </div>
      </Fragment>
      {onVoteDown ? (
        <div
          aria-label="downvote"
          className={`arrow ${
            likes === false ? "downmod" : "down"
          } login-required access-required`}
          data-event-action="downvote"
          role="button"
          tabIndex={0}
          onClick={onVoteDown}
        />
      ) : null}
    </div>
    {thumbnail &&
    !["image", "default", "nsfw", "self"].find(sub => sub === thumbnail) ? (
      <Link
        className="thumbnail may-blank loggedin"
        href={url}
        rel={nofollow && !is_self ? "nofollow noopener" : "noopener"}
        target={is_self ? null : linkTarget}
      >
        <img alt="Thumb" height={70} src={thumbnail} width={70} />
      </Link>
    ) : null}
    {thumbnail === "self" ? (
      <Link className="thumbnail may-blank loggedin self" />
    ) : null}
    <div className="entry unvoted">
      <p className="title">
        {link_flair_text || link_flair_css_class ? (
          <span className="linkflairlabel" title={link_flair_text}>
            {link_flair_text}
          </span>
        ) : null}
        <Link
          className="title may-blank loggedin"
          href={url}
          tabIndex={rank}
          rel={nofollow ? "nofollow noopener" : "noopener"}
          target={is_self ? null : linkTarget}
        >
          {title}
        </Link>{" "}
        {domain ? (
          <span className="domain">
            (<Link href={`/domain/${domain}/`}>{domain}</Link>)
          </span>
        ) : null}
      </p>
      {onToggleExpando && !(isDetail && is_self) ? (
        <div
          title="toggle"
          className={`expando-button ${
            expanded ? "expanded" : "collapsed"
          } ${expandoType}`}
          role="button"
          onClick={onToggleExpando}
        />
      ) : null}
      <p className="tagline">
        {preTagline || null}
        submitted <Timestamp {...{ created, created_utc }} />
        {edited ? <Timestamp {...{ edited }} /> : null}
        {author ? (
          <Fragment>
            {" by "}
            <AuthorLink
              {...{
                author,
                author_fullname,
                author_flair_text,
                author_flair_css_class
              }}
            />
            {subreddit ? "to " : ""}
          </Fragment>
        ) : subreddit ? (
          " to "
        ) : (
          ""
        )}
        {subreddit ? (
          <Link
            className="subreddit hover may-blank"
            href={`/${siteprefix}/${subreddit}`}
          >
            {siteprefix}/{subreddit}
          </Link>
        ) : null}
        {postTagline || null}
      </p>
      {isDetail && selftext
        ? optional(Expando, {
            ...props,
            expanded,
            is_self,
            selftext,
            selftext_html
          })
        : null}
      <ul className="flat-list buttons">
        {over_18 ? (
          <li>
            <span className="nsfw-stamp stamp">
              <acronym title="not safe for work">nsfw</acronym>
            </span>
          </li>
        ) : null}
        {preButtons || null}
        {permalink ? (
          <li className="first">
            <Link
              className="bylink comments may-blank"
              data-event-action="comments"
              href={permalink}
              rel="nofollow"
            >
              {num_comments} comments
            </Link>
          </li>
        ) : null}
        {onToggleEditing ? (
          <li className="submission-edit-button edit-button">
            <a title="edit" href="" onClick={onToggleEditing}>
              edit
            </a>
          </li>
        ) : null}
        {onShare ? (
          <li className="share">
            {typeof onShare === "string" ? (
              <a
                className="post-sharing-button"
                href={onShare}
                target="_blank"
                rel="noopener noreferrer"
              >
                share
              </a>
            ) : (
              <a className="post-sharing-button" onClick={onShare}>
                share
              </a>
            )}
          </li>
        ) : null}
        {onSave ? (
          <li className="link-save-button save-button">
            <a onClick={onSave}>save</a>
          </li>
        ) : null}
        {onHide ? (
          <li>
            <form className="state-button hide-button">
              <input name="executed" type="hidden" defaultValue="hidden" />
              <span>
                <a data-event-action="hide" onClick={onHide}>
                  hide
                </a>
              </span>
            </form>
          </li>
        ) : null}
        {onReport ? (
          <li className="report-button">
            <a
              className="action-thing reportbtn access-required"
              onClick={onReport}
              data-event-action="report"
            >
              report
            </a>
          </li>
        ) : null}
        {banned_by ? (
          <li>
            <b>[removed by {banned_by}]</b>
          </li>
        ) : null}
        {locked ? (
          <li>
            <b>[locked]</b>
          </li>
        ) : null}
        {!brand_safe ? (
          <li>
            <span className="nsfw-stamp stamp">
              <acronym title="not safe for brand">nsfb</acronym>
            </span>
          </li>
        ) : null}
        {meta_thing ? (
          <li>
            <Link
              href={meta_thing.data.permalink}
              title={`${meta_thing.data.score} points`}
            >
              {meta_thing.data.num_comments} comments on {siteprefix}/
              {meta_thing.data.subreddit}
            </Link>
          </li>
        ) : null}
        {postButtons || null}
      </ul>
      {isDetail && selftext
        ? null
        : optional(Expando, {
            ...props,
            expanded,
            is_self,
            selftext,
            selftext_html
          })}
      <div className="reportform" />
    </div>
    <div className="child" />
    <div className="clearleft" />
  </div>
);

export default ThingLink;
