import React, { Fragment } from "react";
import ExpandoComponent from "./Expando";
import LinkComponent from "./Link";
import { optional } from "../util";

export const ThingLink = ({
  Link=LinkComponent,
  Expando=ExpandoComponent,
  Timestamp = ({ created }) => created,
  onClick,
  onShare,
  onSave,
  onHide,
  onReport,
  onVoteUp,
  onVoteDown,
  isVoting,
  id,
  expanded = false,
  onToggleExpando,
  image,
  video,
  iframe,
  name,
  author,
  domain,
  over_18,
  rank,
  stickied,
  score,
  downs,
  ups,
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
  is_self,
  created,
  created_utc,
  selftext,
  selftext_html,
  permalink,
  thumbnail,
  locked,
  brand_safe,
  preview,
  secure_media_embed,
  banned_by,
  meta_thing,
  siteprefix,
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
    data-author-fullname=""
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
    <div className={`midcol ${likes === false ? "dislikes" : likes === true ? "likes" : "unvoted"}`}>
      {onVoteUp ? (
        <div
          aria-label="upvote"
          className={`arrow ${likes === true ? "upmod" : "up"} login-required access-required`}
          data-event-action="upvote"
          role="button"
          tabIndex={0}
          onClick={onVoteUp}
        />
      ) : null}
      {isVoting ? (
        <Fragment>
          <div className="score dislikes"><div className="loading working"><div className="throbber" /></div></div>
          <div className="score unvoted"><div className="loading working"><div className="throbber" /></div></div>
          <div className="score likes"><div className="loading working"><div className="throbber" /></div></div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="score dislikes">{score > 10000 ? (score/1000.0).toFixed(1)+"k" : score}</div>
          <div className="score unvoted">{score  > 10000 ? (score/1000.0).toFixed(1)+"k" : score}</div>
          <div className="score likes">{score > 10000 ? (score/1000.0).toFixed(1)+"k" : score}</div>
        </Fragment>
      )}
      {onVoteDown ? (
        <div
          aria-label="downvote"
          className={`arrow ${likes === false ? "downmod" : "down"} login-required access-required`}
          data-event-action="downvote"
          role="button"
          tabIndex={0}
          onClick={onVoteDown}
        />
      ) : null}
    </div>
    {(thumbnail && !["image", "default", "nsfw", "self"].find((sub => sub === thumbnail))) ? (
      <Link
        className="thumbnail may-blank loggedin"
        href={url}
        target={is_self ? null : linkTarget}
      >
        <img
          alt="Thumb"
          height={70}
          src={thumbnail}
          width={70}
        />
      </Link>
    ) : null}
    {thumbnail === "self" ? <Link className="thumbnail may-blank loggedin self" /> : null}
    <div className="entry unvoted">
      <p className="title">
        {(link_flair_text || link_flair_css_class) ? (
          <span className="linkflairlabel" title={link_flair_text}>{link_flair_text}</span>
        ) : null}
        <Link
          className="title may-blank loggedin"
          href={url}
          tabIndex={rank}
          target={is_self ? null : linkTarget}
        >{title}</Link>{" "}
        <span className="domain">
          (<Link href={`/domain/${domain}/`}>{domain}</Link>)
        </span>
      </p>
      {(selftext || image || video || iframe) ? <div
        title="toggle"
        className={`expando-button ${expanded ? "expanded" : "collapsed"} selftext`}
        role="button"
        onClick={onToggleExpando}
      /> : null}
      <p className="tagline">
        submitted <Timestamp {...{ created, created_utc }} />
        {author ? (
          <Fragment>
            {" by "}
            <Link
              className="author may-blank"
              href={`/user/${author}`}
            >{author}</Link>
          </Fragment>
        ) : null}
        {" to "}
        <Link
          className="subreddit hover may-blank"
          href={`/${siteprefix}/${subreddit}`}
        >{siteprefix}/{subreddit}</Link>
      </p>
      {optional(Expando, { ...props, expanded, is_self, selftext, selftext_html, image, video, iframe })}
      <ul className="flat-list buttons">
        {over_18 ? (
          <li>
            <span className="nsfw-stamp stamp">
              <acronym title="not safe for work">nsfw</acronym>
            </span>
          </li>
        ) : null}
        {permalink ? (
          <li className="first">
            <Link
              className="bylink comments may-blank"
              data-event-action="comments"
              href={permalink}
              rel="nofollow"
            >{num_comments} comments</Link>
          </li>
        ) : null}
        {onShare ? (
          <li className="share">
            <a className="post-sharing-button">share</a>
          </li>
        ) : null}
        {onSave ? (
          <li className="link-save-button save-button">
            <a>save</a>
          </li>
        ) : null}
        {onHide ? (
          <li>
            <form className="state-button hide-button" >
              <input name="executed" type="hidden" defaultValue="hidden" />
              <span>
                <a data-event-action="hide" >hide</a>
              </span>
            </form>
          </li>
        ) : null}
        {onReport ? (
          <li className="report-button">
            <a className="action-thing reportbtn access-required" data-event-action="report" >
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
          <li><Link href={meta_thing.data.permalink} title={`${meta_thing.data.score} points`}>
            {meta_thing.data.num_comments} comments on {siteprefix}/{meta_thing.data.subreddit}
          </Link></li>
        ) : null}
      </ul>
      <div className="reportform" />
    </div>
    <div className="child" />
    <div className="clearleft" />
  </div>
);

export default ThingLink;
