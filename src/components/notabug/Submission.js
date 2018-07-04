import React, { PureComponent, Fragment } from "react";
import { Helmet } from "react-helmet";
import { compose } from "ramda";
import urllite from "urllite";
import { ThingLink } from "snew-classic-ui";
import { notabugSubmissionSummary } from "state/notabug";
import { injectState } from "freactal";
import { Markdown } from "./Markdown";
import { Timestamp } from "./Timestamp";
import { Link } from "./Link";
import { withRouter } from "react-router-dom";
import slugify from "slugify";
import { Expando, getExpando } from "./Expando";

const nsfwRe = /(nsfw|porn|sex|jailbait|fuck|shit|piss|cunt|cock|penis|nigger|kike|nsfl)/i;

class SubmissionBase extends PureComponent {
  constructor(props) {
    super(props);
    this.onVoteUp = this.onVoteUp.bind(this);
    this.onVoteDown = this.onVoteDown.bind(this);
  }

  render() {
    const {
      id,
      ups,
      downs,
      comments,
      expanded,
      rank,
      isViewing,
      onToggleExpando,
      state: { notabugApi, isVotingUp, isVotingDown },
    } = this.props;
    let { item } = this.props;

    item = item || { title: "...", timestamp: notabugApi.getTimestamp(id)  }; // eslint-disable-line

    const urlInfo = item.url ? urllite(item.url) : {};
    const permalink = `/t/${item.topic || "all"}/comments/${id}/` + slugify(item.title.toLowerCase());
    const domain = item.url
      ? (urlInfo.host || "").replace(/^www\./, "")
      : item.topic ? `self.${item.topic}` : null;

    const { image, video, iframe } = getExpando(item, domain);

    const expandoType = item.body ? "selftext" : video ? "video" : image ? "video" : iframe ? "video": null;

    return (
      <Fragment>
        {isViewing ? (
          <Helmet>
            <title>{item.title}</title>
          </Helmet>
        ) : null}
        <ThingLink
          Markdown={Markdown}
          Expando={Expando}
          Timestamp={Timestamp}
          Link={Link}
          isDetail={isViewing}
          id={id}
          title={item.title}
          author={item.author}
          over_18={!!nsfwRe.test(item.title + item.body + item.topic)}
          subreddit={item.topic ? item.topic.toLowerCase() : ""}
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
          scoreTooltip={`+${ups} / -${downs}`}
          onVoteUp={this.onVoteUp}
          onVoteDown={this.onVoteDown}
          expandoType={expandoType}
          onToggleExpando={expandoType ? onToggleExpando : null}
          image={image}
          video={video}
          iframe={iframe}
        />
      </Fragment>
    );
  }

  onVoteUp() {
    const { onSubscribe } = this.props;
    onSubscribe && onSubscribe();
    this.props.effects.onVoteUp();
  }

  onVoteDown() {
    const { onSubscribe } = this.props;
    onSubscribe && onSubscribe();
    this.props.effects.onVoteDown();
  }
}

export const Submission = compose(withRouter, notabugSubmissionSummary, injectState)(SubmissionBase);
