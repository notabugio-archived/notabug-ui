import React, { useState, useEffect, useCallback, useMemo } from "react";
import { propOr } from "ramda";
import Spinner from "react-spinkit";
import { COMMENT_BODY_MAX } from "notabug-peer";
import { ThingComment } from "snew-classic-ui";
import { Markdown, Timestamp, Link, slugify } from "utils";
import { NestedListing } from "Comment/NestedListing";
import { ThingCommentEntry as Entry } from "./Entry";

const MarkdownLoading = () => (
  <div className="usertext-body may-blank-within md-container">
    <div className="md">
      <Spinner name="ball-beat" color="#cee3f8" />
      <div className="clearleft" />
    </div>
  </div>
);

const TimestampSaving = () => "...saving...";

export const Comment = ({
  id,
  topic: topicProp,
  ups = 0,
  downs = 0,
  disableChildren,
  fetchParent,
  item: propItem,
  parentItem: propParentItem,
  isShowingReply,
  collapsed: collapsedProp = false,
  ThingCommentEntry = Entry,
  listingParams,
  replyTree,
  isSpeculative,
  speculativeIds,
  addSpeculativeId,
  isVotingUp,
  isVotingDown,
  onVoteUp,
  onVoteDown,
  onShowReply,
  onHideReply
}) => {
  const [collapsed, setCollapsed] = useState(collapsedProp);
  const item = propItem || { body: "...", topic: "whatever" };
  const { topic } = item || topicProp;
  const parentItem = propParentItem || (fetchParent ? { title: "..." } : null);
  let parentParams = {};

  const parentPermalink = useMemo(
    () => {
      if (!item.opId || !topic || !parentItem || !parentItem.title) return;
      return `/t/${topic}/comments/${item.opId}/${slugify(parentItem.title)}`;
    },
    [topic, item.opId, parentItem]
  );

  if (fetchParent) {
    parentParams = {
      fetchParent: true,
      showLink: true,
      link_title: propOr("", "title", parentItem),
      link_permalink: parentPermalink,
      link_author: propOr(null, "author", parentItem),
      link_author_fullname: propOr(null, "authorId", parentItem),
      subreddit: propOr(null, "topic", parentItem)
    };
  }

  const onToggleExpand = useCallback(() => setCollapsed(!collapsed), [
    collapsed
  ]);

  useEffect(() => setCollapsed(collapsedProp), [collapsedProp]);

  return (
    <ThingComment
      {...{
        ...parentParams,
        ThingCommentEntry,
        Timestamp: isSpeculative ? TimestampSaving : Timestamp,
        Link,
        id,
        listingParams,
        replyTree,
        isSpeculative,
        speculativeIds,
        addSpeculativeId,
        ups,
        downs,
        collapsed,
        isVotingUp,
        isVotingDown,
        onToggleExpand,
        onVoteUp,
        onVoteDown,
        onShowReply,
        onHideReply
      }}
      Markdown={propItem ? Markdown : MarkdownLoading}
      NestedListing={disableChildren ? () => null : NestedListing}
      opId={item.opId}
      body={item.body ? item.body.slice(0, COMMENT_BODY_MAX) : item.body}
      author={item.author}
      author_fullname={item.authorId}
      siteprefix="t"
      name={id}
      parent_id={item.replyToId}
      topic={topic || item.topic}
      created={item.timestamp / 1000}
      created_utc={item.timestamp / 1000}
      showLink
      scoreTooltip={`+${ups} / -${downs}`}
      showReplyForm={isShowingReply}
    />
  );
};
