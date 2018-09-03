import React, { Fragment } from "react";
import { injectState } from "freactal";
import { ThingCommentEntry as SnewThingCommentEntry } from "snew-classic-ui";
import { Link } from "utils";
import { AuthorLink } from "Auth";
import { votingItemProvider } from "Voting";

export const ThingCommentEntryBase = ({
  state: { isVotingUp, isVotingDown },
  effects,
  hideReply,
  ups,
  downs,
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
    score={null}
    afterAuthor={(
      <Fragment>
        {isVotingUp || isVotingDown ? <span className="loading working"><span className="throbber" /></span> : null}
        <span className="score individual-vote-counts">
          <span className="score likes" title="upvotes">+{ups}</span>
          {" "}
          <span className="score dislikes" title="downvotes">-{downs}</span>
          {" "}
          points
        </span>
      </Fragment>
    )}
    isVoting={isVotingUp || isVotingDown}
    onVoteUp={effects.onVoteUp}
    onVoteDown={effects.onVoteDown}
  />
);

export const ThingCommentEntry = votingItemProvider(injectState(ThingCommentEntryBase));
