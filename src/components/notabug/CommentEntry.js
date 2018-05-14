import React from "react";
import { ThingCommentEntry as SnewThingCommentEntry } from "snew-classic-ui";
import { injectState } from "freactal";
import { notabugVotable } from "state/notabug";

export const ThingCommentEntry = notabugVotable(injectState(({
  ...props,
  state: { isVotingUp, isVotingDown },
  effects
}) => (
  <SnewThingCommentEntry
    {...props}
    likes={isVotingUp ? true : isVotingDown ? false : undefined}
    onShowReply={e => {
      e.preventDefault();
      effects.onNotabugSetReplyTo(props.id);
    }}
    isVoting={isVotingUp || isVotingDown}
    onVoteUp={effects.onVoteUp}
    onVoteDown={effects.onVoteDown}
  />
)));
