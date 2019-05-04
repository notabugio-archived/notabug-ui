import React, { Fragment } from "react";
import { ThingCommentEntry as SnewThingCommentEntry } from "/vendor/snew-classic-ui";
import { Link } from "/utils";
import { AuthorLink } from "/Auth";

export const ThingCommentEntry = React.memo(
  ({
    ups,
    downs,
    isVotingUp,
    isVotingDown,
    onVoteUp,
    onVoteDown,
    ...props
  }) => (
    <SnewThingCommentEntry
      {...props}
      Link={Link}
      AuthorLink={AuthorLink}
      likes={isVotingUp ? true : isVotingDown ? false : undefined}
      score={null}
      afterAuthor={
        <Fragment>
          <span className="score individual-vote-counts">
            <span className="score likes" title="upvotes">
              +{ups}
            </span>{" "}
            <span className="score dislikes" title="downvotes">
              -{downs}
            </span>{" "}
            points
          </span>
        </Fragment>
      }
      onVoteUp={onVoteUp}
      onVoteDown={onVoteDown}
    />
  )
);
