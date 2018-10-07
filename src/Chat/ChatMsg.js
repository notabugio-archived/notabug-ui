import React from "react";
import { injectState } from "freactal";
import { ThingCommentEntry as SnewThingCommentEntry } from "snew-classic-ui";
import { COMMENT_BODY_MAX } from "notabug-peer";
import { Link } from "utils";
import { AuthorLink } from "Auth";
import { Comment } from "Comment";
import { votingItemProvider } from "Voting";

const ChatMsgEntry = votingItemProvider(injectState(({
  state: { isVotingUp, isVotingDown },
  effects,
  ...props
}) => (
  <SnewThingCommentEntry
    {...props}
    body={props.body ?  props.body.slice(0, COMMENT_BODY_MAX) : props.body}
    score={(props.ups || props.downs) ? props.score : null}
    Link={Link}
    AuthorLink={AuthorLink}
    likes={isVotingUp ? true : isVotingDown ? false : undefined}
    isVoting={isVotingUp || isVotingDown}
    onVoteUp={effects.onVoteUp}
    onVoteDown={effects.onVoteDown}
  />
)));

export const ChatMsg = (props) => (
  <Comment {...props} ThingCommentEntry={ChatMsgEntry} />
);
