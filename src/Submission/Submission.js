import React, { Fragment, useMemo } from "react";
// import { Helmet } from "react-helmet";
import { usePageContext } from "NabContext";
import { always } from "ramda";
import { withRouter } from "react-router-dom";
import { parse as parseURI } from "uri-js";
import { ThingLink } from "snew-classic-ui";
import { Markdown, Timestamp, Link, slugify, interceptClicks } from "utils";
import { Expando, getExpando } from "./Expando";
import { AuthorLink } from "Auth";
// import { SaveThingButton } from "SaveThing";

const nsfwRe = /(nsfw|porn|hentai|ecchi|sex|jailbait|fuck|shit|piss|cunt|cock|penis|nigger|kike|nsfl)/i;
const ThingLinkComponent = withRouter(interceptClicks(ThingLink));

export const Submission = ({
  id,
  ups,
  downs,
  score,
  comments,
  expanded,
  rank,
  isDetail,
  onToggleExpando,
  item,
  isVotingUp,
  isVotingDown,
  isEditing,
  edited,
  editedBody,
  onSubmitEdit,
  onChangeEditedBody,
  onToggleEditing,
  onVoteUp,
  onVoteDown
}) => {
  const { spec: space } = usePageContext();
  const { isIdSticky = always(false) } = space || {};
  let scoreDisp = null;

  if (score || score === 0) scoreDisp = ups - downs || 0;

  if (scoreDisp > 10000) scoreDisp = `${(scoreDisp / 1000).toFixed(1)}k`;
  item = item || { title: "...", timestamp: null }; // eslint-disable-line
  const urlInfo = item.url ? parseURI(item.url) : {};
  const permalink = useMemo(() => {
    let title = item.title;

    if (title && !title.split) {
      title = JSON.stringify(title);
    }
    const base =
      space && space.useForComments
        ? `/user/${space.owner}/spaces/${space.spaceName}/comments/${id}/`
        : `/t/${item.topic || "all"}/comments/${id}/`;

    return title ? base + slugify(title.toLowerCase()) : base;
  }, [item.topic, id, item.title]);
  const domain = item.url
    ? (urlInfo.host || urlInfo.scheme || "").replace(/^www\./, "")
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
      {/* isViewing ? (
        <Helmet>
          <title>{item.title}</title>
        </Helmet>
      ) : null*/}
      <ThingLinkComponent
        nofollow
        {...{
          Markdown,
          Expando,
          Timestamp,
          Link,
          EmbedComponent,
          id,
          domain,
          permalink,
          isDetail,
          edited,
          isEditing,
          editedBody,
          onChangeEditedBody,
          onSubmitEdit,
          onToggleEditing: !item.url && isDetail && onToggleEditing
        }}
        {...{ rank, onVoteUp, onVoteDown, expandoType, image, video, iframe }}
        expanded={expanded || (isDetail && !item.url)}
        stickied={isIdSticky(id)}
        ups={ups || 0}
        downs={downs || 0}
        AuthorLink={AuthorLink}
        title={item.title || ""}
        author={item.author || ""}
        author_fullname={item.authorId || ""}
        over_18={!!nsfwRe.test(item.title + item.topic)}
        subreddit={item.topic ? item.topic.toLowerCase() : ""}
        selftext={item.body || ""}
        name={id}
        created={item.timestamp ? item.timestamp / 1000 : null}
        created_utc={item.timestamp ? item.timestamp / 1000 : null}
        url={item.url || permalink || ""}
        brand_safe={true}
        siteprefix={"t"}
        is_self={!item.url}
        score={scoreDisp}
        num_comments={comments}
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
