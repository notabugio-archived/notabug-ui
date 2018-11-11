import React, { Fragment } from "react";
// import { Helmet } from "react-helmet";
import urllite from "urllite";
import { ThingLink } from "snew-classic-ui";
import { Markdown, Timestamp, Link, slugify } from "utils";
import { Expando, getExpando } from "./Expando";
import { AuthorLink } from "Auth";
// import { SaveThingButton } from "SaveThing";

const nsfwRe = /(nsfw|porn|hentai|ecchi|sex|jailbait|fuck|shit|piss|cunt|cock|penis|nigger|kike|nsfl)/i;

export const Submission = ({
  id,
  ups,
  downs,
  score,
  comments,
  expanded,
  rank,
  isViewing,
  isDetail,
  onToggleExpando,
  item,
  isVotingUp,
  isVotingDown,
  onVoteUp,
  onVoteDown
}) => {
  let scoreDisp = null;
  if (score || score === 0) scoreDisp = (ups - downs) || 0;
  item = item || { title: "...", timestamp: null }; // eslint-disable-line
  const urlInfo = item.url ? urllite(item.url) : {};
  const permalink =
    `/t/${item.topic || "all"}/comments/${id}/` +
    slugify(item.title.toLowerCase());
  const domain = item.url
    ? (urlInfo.host || "").replace(/^www\./, "")
    : item.topic
    ? `self.${item.topic}`
    : null;
  const { expandoType, image, video, iframe, EmbedComponent } = getExpando(
    item,
    domain,
    urlInfo
  );

  return (
    <Fragment>
      {/*isViewing ? (
        <Helmet>
          <title>{item.title}</title>
        </Helmet>
      ) : null*/}
      <ThingLink
        {...{
          Markdown,
          Expando,
          Timestamp,
          Link,
          EmbedComponent,
          id,
          domain,
          permalink
        }}
        {...{ rank, onVoteUp, onVoteDown, expandoType, image, video, iframe }}
        expanded={expanded || (isDetail && !item.url)}
        ups={ups || 0}
        downs={downs || 0}
        AuthorLink={AuthorLink}
        isDetail={isViewing}
        title={item.title}
        author={item.author}
        author_fullname={item.authorId}
        over_18={!!nsfwRe.test(item.title + item.topic)}
        subreddit={item.topic ? item.topic.toLowerCase() : ""}
        selftext={item.body}
        name={id}
        created={item.timestamp / 1000}
        created_utc={item.timestamp / 1000}
        url={item.url || permalink}
        brand_safe={true}
        siteprefix={"t"}
        is_self={!item.url}
        score={scoreDisp}
        num_comments={comments}
        isVoting={isVotingUp || isVotingDown}
        likes={isVotingUp ? true : isVotingDown ? false : undefined}
        linkTarget="_blank"
        scoreTooltip={`+${ups} / -${downs}`}
        preTagline={
          <span className="individual-vote-counts">
            <span className="score likes" title="upvotes">
              +{ups}
            </span>{" "}
            <span className="score dislikes" title="downvotes">
              -{downs}
            </span>{" "}
          </span>
        }
        /*
        postButtons={notabugUser ? (
          <Fragment>
            <SaveThingButton id={id} className="link-save-button save-button" />
            <SaveThingButton label="hide" className="hide-button" id={id} />
            <SaveThingButton label="spam" className="remove-button" id={id} />
          </Fragment>
        ) : null}
        */
        onToggleExpando={expandoType ? onToggleExpando : null}
      />
    </Fragment>
  );
};

export default Submission;
