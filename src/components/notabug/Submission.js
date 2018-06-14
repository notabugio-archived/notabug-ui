import React, { Fragment } from "react";
import { Helmet } from "react-helmet";
import compose from "ramda/es/compose";
import urllite from "urllite";
import { ThingLink } from "snew-classic-ui";
import { notabugSubmissionSummary } from "state/notabug";
import { injectState } from "freactal";
import { Markdown } from "./Markdown";
import { Timestamp } from "./Timestamp";
import { Link } from "./Link";
import { withRouter } from "react-router-dom";
import slugify from "slugify";

const nsfwRe = /(nsfw|porn|sex|jailbait|fuck|shit|piss|cunt|cock|penis|nigger|kike|nsfl)/i;

const SubmissionBase = ({
  id,
  item,
  ups,
  downs,
  comments,
  effects,
  expanded,
  rank,
  isViewing,
  state: { isVotingUp, isVotingDown },
}) => {
  const urlInfo = item.url ? urllite(item.url) : {};
  const permalink = `/t/${item.topic}/comments/${id}/` + slugify(item.title.toLowerCase());
  const domain = item.url ? (urlInfo.host || "").replace(/^www\./, "") : `self.${item.topic}`;

  return (
    <Fragment>
      {isViewing ? (
        <Helmet>
          <title>{item.title}</title>
        </Helmet>
      ) : null}
      <ThingLink
        Markdown={Markdown}
        Timestamp={Timestamp}
        Link={Link}
        id={id}
        title={item.title}
        author={item.author}
        over_18={!!nsfwRe.test(item.title + item.body + item.topic)}
        subreddit={item.topic.toLowerCase()}
        selftext={item.body}
        name={id}
        created={item.timestamp / 1000}
        created_utc={item.timestamp / 1000}
        url={item.url || permalink}
        domain={domain}
        brand_safe={true}
        siteprefix={"t"}
        permalink={permalink}
        expanded={expanded}
        rank={rank}
        is_self={!item.url}
        ups={ups}
        downs={downs}
        score={ups-downs}
        num_comments={comments}
        isVoting={isVotingUp || isVotingDown}
        likes={isVotingUp ? true : isVotingDown ? false : undefined}
        linkTarget="_blank"
        onVoteUp={effects.onVoteUp}
        onVoteDown={effects.onVoteDown}
      />
    </Fragment>
  );
};

export const Submission = compose(withRouter, notabugSubmissionSummary, injectState)(SubmissionBase);
