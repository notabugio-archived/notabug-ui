import React, { useState, useEffect, useCallback } from "react";
import { propOr, compose } from "ramda";
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

export const Comment = ({
  id,
  topic,
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
  isVotingUp,
  isVotingDown,
  onVoteUp,
  onVoteDown,
  onShowReply,
  onHideReply
}) => {
  const [collapsed, setCollapsed] = useState(collapsedProp);
  const item = propItem || { body: "..." };
  const parentItem = propParentItem || (fetchParent ? { title: "..." } : null);
  let parentParams = {};

  if (fetchParent) {
    parentParams = {
      fetchParent: true,
      showLink: true,
      link_title: propOr("", "title", parentItem),
      link_permalink: compose(({ topic, title }) => {
        if (!item.opId || !topic || !title) return;
        return `/t/${topic}/comments/${item.opId}/${slugify(
          title.toLowerCase()
        )}`;
      })(parentItem),
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
        Timestamp,
        Link,
        id,
        listingParams,
        replyTree,
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
