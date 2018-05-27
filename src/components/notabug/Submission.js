import React from "react";
import { compose } from "ramda";
import urllite from "urllite";
import { ThingLink } from "./ThingLink";
import { notabugSubmissionSummary } from "state/notabug";
import { injectState } from "freactal";
import { Markdown } from "./Markdown";
import { Timestamp } from "./Timestamp";
import { Link } from "./Link";
import { withRouter } from "react-router-dom";
import pure from "components/pure";
import slugify from "slugify";

export const SubmissionBase = ({
  id, 
  item, 
  ups, 
  downs,
  comments, 
  effects, 
  expanded, 
  onToggleExpando,
  rank,
  state: { isVotingUp, isVotingDown}
}) => {
  const urlInfo = item.url ? urllite(item.url) : {};
  const permalink = `/t/${item.topic}/comments/${id}/` + slugify(item.title.toLowerCase());
  const domain = item.url ? (urlInfo.host || "").replace(/^www\./, "") : `self.${item.topic}`;

  const image = (item.url && (item.url.indexOf(".jpg") !== -1 || item.url.indexOf(".png") !== -1 || item.url.indexOf(".gif") !== -1)) ? item.url : null;

  const video = (item.url && (item.url.indexOf(".mp4") !== -1 || item.url.indexOf(".mov") !== -1 || item.url.indexOf(".webm") !== -1 || item.url.indexOf(".ogv") !== -1)) ? item.url : null; 

  const iframe = (domain === "youtube.com" && item.url.indexOf("?v=") !== -1) ? "https://www.youtube.com/embed/" + item.url.substring(item.url.indexOf("?v=")+3, item.url.length) :
  (domain === "youtu.be" && item.url.indexOf(".be/") !== -1) ? "https://www.youtube.com/embed/" + item.url.substring(item.url.indexOf(".be/")+4, item.url.length) : 
  (domain === "hooktube.com" && item.url.indexOf("?v=") !== -1) ? "https://www.hooktube.com/embed/" + item.url.substring(item.url.indexOf("?v=")+3, item.url.length) :
  (domain === "bitchute.com" && item.url.indexOf("/video/") !== -1) ? "https://www.bitchute.com/embed/" + item.url.substring(item.url.indexOf("/video/")+7, item.url.length) :
  (domain === "dailymotion.com" && item.url.indexOf("/video/") !== -1) ? "https://www.dailymotion.com/embed/video/" + item.url.substring(item.url.indexOf("/video/")+7, item.url.length) :
  (domain === "vimeo.com" && item.url.indexOf(".com/") !== -1) ? "https://player.vimeo.com/video/" + item.url.substring(item.url.indexOf(".com/")+5, item.url.length) :
  (domain === "vevo.com" && item.url.indexOf("/watch/") !== -1) ? "https://embed.vevo.com?isrc=" + item.url.substring(item.url.lastIndexOf("/")+1, item.url.length) :
  (domain === "gfycat.com" && item.url.indexOf("/detail/") !== -1) ? "https://gfycat.com/ifr/" + item.url.substring(item.url.indexOf("/detail/")+8, item.url.length) :
  (domain === "gfycat.com" && item.url.indexOf(".com/") !== -1) ? "https://gfycat.com/ifr/" + item.url.substring(item.url.indexOf(".com/")+5, item.url.length) :
  (domain === "giphy.com" && item.url.indexOf("/html5") !== -1) ? "https://giphy.com/embed/" + item.url.substring(item.url.lastIndexOf("/gifs/")+6, item.url.length).replace("/html5","") :
  (domain === "giphy.com" && item.url.indexOf("/gifs/") !== -1) ? "https://giphy.com/embed/" + item.url.substring(item.url.lastIndexOf("-")+1, item.url.length) :
  null;

  return (
    <ThingLink
      Markdown={Markdown}
      Timestamp={Timestamp}
      Link={Link}
      id={id}
      title={item.title}
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
      linkTarget="_new"
      onVoteUp={effects.onVoteUp}
      onVoteDown={effects.onVoteDown}
      onToggleExpando={onToggleExpando}
      image={image}
      video={video}
      iframe={iframe}
    />
  );
}

export const Submission = compose(withRouter, notabugSubmissionSummary, injectState, pure)(SubmissionBase);
