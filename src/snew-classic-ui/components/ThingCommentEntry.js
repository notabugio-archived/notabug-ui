import React, { Fragment } from "react";
import LinkComponent from "./Link";
import AuthorLinkComponent from "./AuthorLink";
import MarkdownComponent from "./Markdown";

const ThingCommentEntry = ({
  Link = LinkComponent,
  Markdown = MarkdownComponent,
  Timestamp = ({ created_utc }) => created_utc,
  AuthorLink = AuthorLinkComponent,
  collapsed,
  name,
  author,
  author_fullname,
  author_flair_text,
  author_flair_css_class,
  subreddit,
  siteprefix="r",
  authorHref,
  score=null,
  downs,
  score_hidden,
  likes,
  ups,
  scoreTooltip,
  body,
  body_html,
  permalink,
  banned_by,
  meta_thing,
  stickied,
  distinguished,
  controversiality,
  created,
  created_utc,
  link_author,
  link_author_fullname,
  link_author_href,
  link_title,
  link_permalink,
  showLink=false,
  replyCount=null,
  preTagline,
  postTagline,
  afterAuthor,
  onReport,
  onGiveGold,
  onSave,
  onToggleExpand,
  onVoteUp,
  onVoteDown,
  onShowReply,
}) => (
  <Fragment>
    <p className="parent">
      <a name={name} />
      {showLink && link_permalink && link_title ? (
        <Fragment>
          <Link href={link_permalink} className="title">{link_title}</Link>
          {link_author ? (
            <Fragment>
              {"by "}
              <AuthorLink {...{ author: link_author, author_fullname: link_author_fullname }} />
              <span className="userattrs" />
            </Fragment>
          ) : null}
          {subreddit ? (
            <Fragment>
              {"in "}
              <Link className="subreddit hover" href={`/${siteprefix}/${subreddit}`}>{subreddit}</Link>
            </Fragment>
          ) : null}
        </Fragment>
      ) : null}
    </p>
    {(onVoteUp || onVoteDown) ? (
      <div className="midcol unvoted">
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
    ) : null}
    <div className="entry unvoted">
      <p className="tagline">
        {preTagline || null}
        {onToggleExpand ? (
          <a
            className="expand"
            onClick={(e) => {
              e.preventDefault();
              onToggleExpand();
            }}
            href=""
          >
            [{collapsed ? "+" : "–"}]
          </a>
        ) : null}
        {author ? (
          <AuthorLink
            className={`author may-blank id-t2_${author_fullname} ${distinguished || ""}`}
            {...{ author, author_fullname, author_flair_text, author_flair_css_class }}
          />
        ) : null}
        {distinguished && (
          <span className="userattrs">
            [<a className={distinguished} title={distinguished} href={`/r/{subreddit}/about/moderators`}>M</a>]
            {" "}
          </span>
        )}
        {afterAuthor || null}
        {score_hidden ? (
          <span className="score-hidden" title="scores are currently hidden for this comment">
            [score hidden]
          </span>
        ) : score !== null ? [
          <span className="score dislikes" key="dislikes" title={scoreTooltip}>{downs} points</span>,
          <span className="score unvoted" key="unvoted" title={scoreTooltip}>{score} points</span>,
          <span className="score likes" key="likes" title={scoreTooltip}>{ups} points</span>
        ] : null}{" "}
        <Timestamp {...{ created, created_utc }} /> 
        {stickied && (<span className="stickied-tagline" title="stickied">stickied comment</span>)}
        {replyCount !== null ? (
          <a className="numchildren" >
            {replyCount} children
          </a>
        ) : null}
        {postTagline || null}
      </p>
      <form
        action="#"
        className="usertext warn-on-unload"
      >
        <input name="thing_id" type="hidden" defaultValue="t1_h1" />
        <Markdown body={body} html={body_html} className="usertext-body may-blank-within md-container" />
      </form>
      <ul className="flat-list buttons">
        {permalink ? (
          <li className="first">
            <Link
              className="bylink"
              data-event-action="permalink"
              href={permalink}
              rel="nofollow"
            >
              permalink
            </Link>
          </li>
        ) : null}
        {onSave ? (
          <li className="comment-save-button save-button">
            <a title="save" onClick={onSave}>save</a>
          </li>
        ) : null}
        {onReport ? (
          <li className="report-button">
            <a
              className="action-thing reportbtn access-required"
              data-event-action="report"
              onClick={onReport}
            >
              report
            </a>
          </li>
        ) : null}
        {onGiveGold ? (
          <li className="give-gold-button">
            <a
              className="give-gold login-required access-required"
              data-event-action="gild"
              href={`/gold?goldtype=gift&months=1&thing=${name}`}
              title="give reddit gold in appreciation of this post."
              onClick={onGiveGold}
            >
              give gold
            </a>
          </li>
        ) : null}
        {onShowReply ? (
          <li className="reply-button">
            <a
              className="access-required"
              data-event-action="comment"
              href={permalink || "#"}
              onClick={onShowReply}
            >
              reply
            </a>
          </li>
        ) : null}
        {banned_by && <li title="[removed]"><b>[removed by moderators]</b></li>}
        {meta_thing && (
          <li><Link href={meta_thing.data.permalink} title={`${meta_thing.data.score} points`}>
            {meta_thing.data.num_comments} comments on r/{meta_thing.data.subreddit}
          </Link></li>
        )}
      </ul>
      <div className="reportform report-t1_h1" />
    </div>
  </Fragment>
);

export default ThingCommentEntry;
