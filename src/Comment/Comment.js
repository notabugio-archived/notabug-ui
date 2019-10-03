import React, { useState, useEffect, useCallback, useMemo } from "react";
import { propOr } from "ramda";
import { Spinner } from "/utils/Spinner";
import { Constants } from "@notabug/peer";
import { ThingComment } from "/vendor/snew-classic-ui";
import { Markdown, Timestamp, Link, slugify } from "/utils";
import { NestedListing } from "/Comment/NestedListing";
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
  ThingCommentEntry = Entry,
  ListingContext,
  id,
  topic: topicProp,
  ups = 0,
  downs = 0,
  disableChildren,
  fetchParent,
  item: propItem,
  edited,
  canEdit,
  isEditing,
  isCommand,
  editedBody,
  onChangeEditedBody,
  onSubmitEdit,
  onToggleEditing,
  parentItem: propParentItem,
  isShowingReply,
  collapsed: collapsedProp = false,
  isSpeculative,
  isVotingUp,
  isVotingDown,
  onVoteUp,
  onVoteDown,
  onShowReply,
  onHideReply,
  onQuoteChat
}) => {
  const [collapsed, setCollapsed] = useState(collapsedProp);
  const item = propItem || { body: "..." };
  const { topic } = item || topicProp;
  const parentItem = propParentItem || (fetchParent ? { title: "..." } : null);
  let body = propOr("", "body", item) || "";

  if (!body.split) {
    body = JSON.stringify(body);
  }
  let parentParams = {};

  const parentPermalink = useMemo(() => {
    if (!item.opId || !topic || !parentItem || !parentItem.title) return "";
    return `/t/${topic}/comments/${item.opId}/${slugify(parentItem.title)}`;
  }, [topic, item.opId, parentItem]);

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
        canEdit,
        isEditing,
        editedBody,
        onChangeEditedBody,
        onSubmitEdit,
        onToggleEditing,
        ListingContext,
        ups,
        downs,
        collapsed,
        edited,
        isCommand,
        isVotingUp,
        isVotingDown,
        onToggleExpand,
        onVoteUp,
        onVoteDown,
        onShowReply,
        onHideReply,
        onQuoteChat
      }}
      Markdown={propItem ? Markdown : MarkdownLoading}
      NestedListing={disableChildren ? () => null : NestedListing}
      opId={item.opId}
      body={body ? body.slice(0, Constants.MAX_THING_BODY_SIZE) : body}
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
