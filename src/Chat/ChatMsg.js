import React from "react";
import { ThingCommentEntry as SnewThingCommentEntry } from "snew-classic-ui";
import { COMMENT_BODY_MAX } from "notabug-peer";
import { Link } from "utils";
import { AuthorLink } from "Auth";
import { Comment } from "Comment";

const ChatMsgEntry = ({
  isVotingUp,
  isVotingDown,
  onVoteUp,
  onVoteDown,
  ...props
}) => (
  <SnewThingCommentEntry
    {...props}
    postTagline={
      props.topic ? (
        <React.Fragment>
          in <Link href={`/t/${props.topic}/chat`}>{props.topic}</Link>
        </React.Fragment>
      ) : null
    }
    body={props.body ? props.body.slice(0, COMMENT_BODY_MAX) : props.body}
    score={props.ups || props.downs ? props.score : null}
    Link={Link}
    AuthorLink={AuthorLink}
    likes={isVotingUp ? true : isVotingDown ? false : undefined}
    isVoting={isVotingUp || isVotingDown}
    onVoteUp={onVoteUp}
    onVoteDown={onVoteDown}
  />
);

export const ChatMsg = props => (
  <Comment {...props} ThingCommentEntry={ChatMsgEntry} />
);
