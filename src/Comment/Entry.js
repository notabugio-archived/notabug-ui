import React, { Fragment } from "react";
import { ThingCommentEntry as SnewThingCommentEntry } from "snew-classic-ui";
import { Link } from "utils";
import { AuthorLink } from "Auth";

export const ThingCommentEntry = ({
  ups,
  downs,
  isVotingUp,
  isVotingDown,
  onVoteUp,
  onVoteDown,
  isSpeculative,
  ...props
}) => (
  <SnewThingCommentEntry
    {...props}
    Link={Link}
    AuthorLink={AuthorLink}
    likes={isVotingUp ? true : isVotingDown ? false : undefined}
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
    isVoting={isSpeculative || isVotingUp || isVotingDown}
    onVoteUp={onVoteUp}
    onVoteDown={onVoteDown}
  />
);
