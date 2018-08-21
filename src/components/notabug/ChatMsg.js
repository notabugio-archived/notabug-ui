import React from "react";
import { ThingCommentEntry as SnewThingCommentEntry } from "snew-classic-ui";
import { COMMENT_BODY_MAX } from "notabug-peer";
import { Link } from "./Link";
import { Comment } from "./Comment";
import { injectState } from "freactal";
import { notabugVotable } from "state/notabug";

const ChatMsgEntry = notabugVotable(injectState(({
  ...props,
  state: { isVotingUp, isVotingDown },
  effects
}) => (
  <SnewThingCommentEntry
    {...props}
    body={props.body ?  props.body.slice(0, COMMENT_BODY_MAX) : props.body}
    score={(props.ups || props.downs) ? props.score : null}
    Link={Link}
    likes={isVotingUp ? true : isVotingDown ? false : undefined}
    isVoting={isVotingUp || isVotingDown}
    onVoteUp={effects.onVoteUp}
    onVoteDown={effects.onVoteDown}
  />
)));

export const ChatMsg = (props) => (
  <Comment {...props} ThingCommentEntry={ChatMsgEntry} />
);
