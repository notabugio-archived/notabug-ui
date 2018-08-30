import React from "react";
import { injectState } from "freactal";
import { ThingCommentEntry as SnewThingCommentEntry } from "snew-classic-ui";
import { Link } from "utils";
import { AuthorLink } from "Auth";
import { votingItemProvider } from "Voting";

export const ThingCommentEntryBase = ({
  state: { isVotingUp, isVotingDown },
  effects,
  hideReply,
  ...props
}) => (
  <SnewThingCommentEntry
    {...props}
    Link={Link}
    AuthorLink={AuthorLink}
    likes={isVotingUp ? true : isVotingDown ? false : undefined}
    onShowReply={hideReply ? null : e => {
      e.preventDefault();
      effects.onNotabugSetReplyTo(props.id);
    }}
    isVoting={isVotingUp || isVotingDown}
    onVoteUp={effects.onVoteUp}
    onVoteDown={effects.onVoteDown}
  />
);

export const ThingCommentEntry = votingItemProvider(injectState(ThingCommentEntryBase));
