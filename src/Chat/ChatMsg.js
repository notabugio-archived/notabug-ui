import React from "react";
import { ThingCommentEntry as SnewThingCommentEntry } from "snew-classic-ui";
import { COMMENT_BODY_MAX } from "notabug-peer";
import { Link } from "utils";
import { AuthorLink } from "Auth";
import { Comment } from "Comment";

const ChatMsgEntry = ({
  isVotingUp,
  isVotingDown,
  ...props
}) => (
  <SnewThingCommentEntry
    {...{ ...props, Link, AuthorLink }}
    onToggleEditing={null}
    postTagline={
      props.topic ? (
        <span className="chat-topic-name">
          {" "}in <Link href={`/t/${props.topic}/chat`}>{props.topic}</Link>
        </span>
      ) : null
    }
    body={props.body ? props.body.slice(0, COMMENT_BODY_MAX) : props.body}
    score={props.ups || props.downs ? props.score : null}
    likes={isVotingUp ? true : isVotingDown ? false : undefined}
    isVoting={isVotingUp || isVotingDown}
  />
);

export const ChatMsg = props => (
  <Comment {...props} ThingCommentEntry={ChatMsgEntry} />
);
